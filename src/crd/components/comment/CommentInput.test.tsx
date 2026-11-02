import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { ComposerAttachment } from './types';

const screenSize = vi.hoisted(() => ({ isSmallScreen: false, isMediumScreen: false, isLargeScreen: true }));

vi.mock('@/crd/hooks/useMediaQuery', async importOriginal => ({
  ...(await importOriginal<typeof import('@/crd/hooks/useMediaQuery')>()),
  useScreenSize: () => screenSize,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { name?: string }) => (opts?.name ? `${key}:${opts.name}` : key),
  }),
}));

// Radix only mounts AvatarPrimitive.Image once the browser reports the image as
// loaded, which never happens in jsdom (same approach as ChatMessageBubble.test.tsx).
vi.mock('@/crd/primitives/avatar', () => ({
  Avatar: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
  AvatarFallback: ({ children, className }: { children: ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

const { CommentInput } = await import('./CommentInput');

const getTextarea = () => screen.getByRole('textbox') as HTMLTextAreaElement;

const typeAndSubmitWithEnter = (text: string) => {
  const textarea = getTextarea();
  fireEvent.change(textarea, { target: { value: text } });
  fireEvent.keyDown(textarea, { key: 'Enter' });
};

describe('CommentInput refocusAfterSubmit', () => {
  test('send button click returns focus to the textarea', () => {
    render(<CommentInput onSubmit={vi.fn()} refocusAfterSubmit={true} />);

    fireEvent.change(getTextarea(), { target: { value: 'hello' } });
    const sendButton = screen.getByRole('button', { name: 'comments.send' });
    sendButton.focus();
    fireEvent.click(sendButton);

    expect(getTextarea()).toHaveFocus();
  });

  test('waits out the in-flight disabled state, then refocuses (Enter send)', () => {
    // Mirrors the chat connector: submitting synchronously flips `disabled` on
    // (isSending), and it stays on until the send settles.
    const Harness = () => {
      const [sending, setSending] = useState(false);
      return (
        <div>
          <button type="button" onClick={() => setSending(false)}>
            settle
          </button>
          <CommentInput onSubmit={() => setSending(true)} refocusAfterSubmit={true} disabled={sending} />
        </div>
      );
    };
    render(<Harness />);

    getTextarea().focus();
    typeAndSubmitWithEnter('hello');
    expect(getTextarea()).toBeDisabled();

    // Browsers drop focus from an element that becomes disabled; jsdom doesn't,
    // so move it away explicitly.
    const settleButton = screen.getByRole('button', { name: 'settle' });
    settleButton.focus();
    expect(getTextarea()).not.toHaveFocus();

    // Send settles, composer re-enables — focus comes back.
    fireEvent.click(settleButton);
    expect(getTextarea()).toBeEnabled();
    expect(getTextarea()).toHaveFocus();
  });

  test('without the prop, focus is not forced back', () => {
    render(<CommentInput onSubmit={vi.fn()} />);

    fireEvent.change(getTextarea(), { target: { value: 'hello' } });
    const sendButton = screen.getByRole('button', { name: 'comments.send' });
    sendButton.focus();
    fireEvent.click(sendButton);

    expect(getTextarea()).not.toHaveFocus();
  });
});

const ready: ComposerAttachment = { id: 'a1', name: 'photo.png', status: 'ready', mimeType: 'image/png' };
const uploading: ComposerAttachment = { id: 'a2', name: 'big.pdf', status: 'uploading', mimeType: 'application/pdf' };
const failed: ComposerAttachment = { id: 'a3', name: 'broken.png', status: 'error', mimeType: 'image/png' };

describe('CommentInput attachments', () => {
  test('imagesOnly renders the image button with the "Add image" name and image chips', () => {
    const { container } = render(
      <CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} imagesOnly={true} attachments={[ready]} />
    );
    const button = screen.getByRole('button', { name: 'comments.attachments.addImage' });
    expect(button.querySelector('svg')).toHaveClass('lucide-image-plus');
    expect(screen.queryByRole('button', { name: 'comments.attachments.attach' })).not.toBeInTheDocument();
    const chip = screen.getByText('photo.png').closest('li') as HTMLElement;
    expect(chip.querySelector('svg')).toHaveClass('lucide-image');
    expect(container.querySelector('.lucide-paperclip')).toBeNull();
  });

  test('without imagesOnly the paperclip button and label are unchanged', () => {
    render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} attachments={[ready]} />);
    const button = screen.getByRole('button', { name: 'comments.attachments.attach' });
    expect(button.querySelector('svg')).toHaveClass('lucide-paperclip');
    expect(screen.queryByRole('button', { name: 'comments.attachments.addImage' })).not.toBeInTheDocument();
    const chip = screen.getByText('photo.png').closest('li') as HTMLElement;
    expect(chip.querySelector('svg')).toHaveClass('lucide-paperclip');
  });

  test('does not render the attach affordance unless attachments are enabled', () => {
    render(<CommentInput onSubmit={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'comments.attachments.attach' })).not.toBeInTheDocument();
  });

  test('picking files reports them to onAttachFiles', () => {
    const onAttachFiles = vi.fn();
    const { container } = render(
      <CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} onAttachFiles={onAttachFiles} />
    );
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onAttachFiles).toHaveBeenCalledWith([file]);
  });

  test('renders a chip per staged attachment and removes on click', async () => {
    const onRemoveAttachment = vi.fn();
    render(
      <CommentInput
        onSubmit={vi.fn()}
        attachmentsEnabled={true}
        attachments={[ready]}
        onRemoveAttachment={onRemoveAttachment}
      />
    );
    expect(screen.getByText('photo.png')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'comments.attachments.removeAttachment:photo.png' }));
    expect(onRemoveAttachment).toHaveBeenCalledWith('a1');
  });

  // The consumer snapshots the ready document ids BEFORE awaiting the send
  // mutation, so a removal accepted mid-send drops the chip while the message
  // still ships that attachment — the user sees one thing and the room gets
  // another. `disabled` is the in-flight-send signal ChatThreadView passes down.
  test('attachment removal is blocked while a send is in flight', async () => {
    const onRemoveAttachment = vi.fn();
    render(
      <CommentInput
        onSubmit={vi.fn()}
        disabled={true}
        attachmentsEnabled={true}
        attachments={[ready]}
        onRemoveAttachment={onRemoveAttachment}
      />
    );

    const remove = screen.getByRole('button', { name: 'comments.attachments.removeAttachment:photo.png' });
    expect(remove).toBeDisabled();
    await userEvent.click(remove);
    expect(onRemoveAttachment).not.toHaveBeenCalled();
  });

  // An aria-label describes the spinner but does not announce its insertion.
  // `<output>` carries an implicit role="status" + aria-live="polite", so the
  // chip appearing mid-upload is actually read out.
  test('an in-flight upload is announced through a live region, not just labelled', () => {
    render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} attachments={[uploading]} />);
    expect(screen.getByRole('status', { name: 'comments.attachments.uploading' })).toBeInTheDocument();
  });

  test('send is enabled for an attachment-only message (no text) once ready', async () => {
    const onSubmit = vi.fn();
    render(<CommentInput onSubmit={onSubmit} attachmentsEnabled={true} attachments={[ready]} />);
    const send = screen.getByRole('button', { name: 'comments.send' });
    expect(send).toBeEnabled();
    await userEvent.click(send);
    expect(onSubmit).toHaveBeenCalledWith('');
  });

  test('send is blocked while an attachment is still uploading', () => {
    render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} attachments={[uploading]} />);
    expect(screen.getByRole('button', { name: 'comments.send' })).toBeDisabled();
  });

  test('surfaces a validation/upload error as an alert', () => {
    render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} attachmentError="Too big" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Too big');
  });

  describe('a failed attachment remains available for explicit retry', () => {
    test('Send submits with the failed file still selected', () => {
      const onSubmit = vi.fn();
      render(<CommentInput onSubmit={onSubmit} attachmentsEnabled={true} attachments={[ready, failed]} />);
      fireEvent.click(screen.getByRole('button', { name: 'comments.send' }));
      expect(onSubmit).toHaveBeenCalledWith('');
      expect(screen.getByText('broken.png')).toBeInTheDocument();
    });

    test('Enter also allows an explicit retry', () => {
      const onSubmit = vi.fn();
      render(<CommentInput onSubmit={onSubmit} attachmentsEnabled={true} attachments={[failed]} value="here you go" />);
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
      expect(onSubmit).toHaveBeenCalledWith('here you go');
    });

    test('the failed file is marked failed in text, not by colour alone', () => {
      render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} attachments={[ready, failed]} />);
      const [readyChip, failedChip] = screen.getAllByRole('listitem');
      expect(failedChip).toHaveTextContent('comments.attachments.failed');
      expect(readyChip).not.toHaveTextContent('comments.attachments.failed');
    });

    test('busy sending disables retry and removal', () => {
      render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} attachments={[failed]} disabled={true} />);
      expect(screen.getByRole('button', { name: 'comments.send' })).toBeDisabled();
      expect(screen.getByRole('button', { name: /comments.attachments.removeAttachment/ })).toBeDisabled();
    });
  });
});

describe('CommentInput drop and paste', () => {
  const image = new File(['png'], 'image.png', { type: 'image/png' });
  const fileTransfer = (files: File[]) => ({ types: ['Files'], files, dropEffect: 'none' });
  const clipboard = (files: File[], types: string[] = files.length ? ['Files'] : []) => ({
    files,
    types,
    getData: () => '',
  });
  // jsdom has no DragEvent, so relatedTarget can't come through the event init.
  const dragLeaveTo = (relatedTarget: Element) => {
    const event = createEvent.dragLeave(getTextarea(), { dataTransfer: fileTransfer([]) });
    Object.defineProperty(event, 'relatedTarget', { value: relatedTarget });
    fireEvent(getTextarea(), event);
  };

  test('dropping files feeds them to onAttachFiles without navigating away', () => {
    const onAttachFiles = vi.fn();
    render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} onAttachFiles={onAttachFiles} />);

    const transfer = fileTransfer([image]);
    expect(fireEvent.dragOver(getTextarea(), { dataTransfer: transfer })).toBe(false);
    expect(transfer.dropEffect).toBe('copy');
    expect(fireEvent.drop(getTextarea(), { dataTransfer: transfer })).toBe(false);

    expect(onAttachFiles).toHaveBeenCalledTimes(1);
    expect(onAttachFiles).toHaveBeenCalledWith([image]);
  });

  test('shows the drop target while files are dragged over the composer', () => {
    render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} onAttachFiles={vi.fn()} />);

    fireEvent.dragEnter(getTextarea(), { dataTransfer: fileTransfer([]) });
    expect(screen.getByText('comments.attachments.dropHint')).toBeInTheDocument();

    // Moving between the composer's own children keeps it.
    dragLeaveTo(screen.getByRole('button', { name: 'comments.send' }));
    expect(screen.getByText('comments.attachments.dropHint')).toBeInTheDocument();

    dragLeaveTo(document.body);
    expect(screen.queryByText('comments.attachments.dropHint')).not.toBeInTheDocument();

    fireEvent.dragOver(getTextarea(), { dataTransfer: fileTransfer([]) });
    fireEvent.drop(getTextarea(), { dataTransfer: fileTransfer([image]) });
    expect(screen.queryByText('comments.attachments.dropHint')).not.toBeInTheDocument();
  });

  test('a text drag is left to the textarea', () => {
    const onAttachFiles = vi.fn();
    render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} onAttachFiles={onAttachFiles} />);

    const transfer = { types: ['text/plain'], files: [], dropEffect: 'none' };
    expect(fireEvent.dragOver(getTextarea(), { dataTransfer: transfer })).toBe(true);
    expect(fireEvent.drop(getTextarea(), { dataTransfer: transfer })).toBe(true);
    expect(onAttachFiles).not.toHaveBeenCalled();
    expect(screen.queryByText('comments.attachments.dropHint')).not.toBeInTheDocument();
  });

  test('while a send is in flight a drop is refused, not swallowed', () => {
    const onAttachFiles = vi.fn();
    render(<CommentInput onSubmit={vi.fn()} disabled={true} attachmentsEnabled={true} onAttachFiles={onAttachFiles} />);

    const transfer = fileTransfer([image]);
    expect(fireEvent.dragOver(getTextarea(), { dataTransfer: transfer })).toBe(false);
    expect(transfer.dropEffect).toBe('none');
    expect(screen.queryByText('comments.attachments.dropHint')).not.toBeInTheDocument();
    fireEvent.drop(getTextarea(), { dataTransfer: transfer });
    expect(onAttachFiles).not.toHaveBeenCalled();
  });

  test('without attachments enabled the composer does not handle drops or file pastes', () => {
    const onAttachFiles = vi.fn();
    render(<CommentInput onSubmit={vi.fn()} onAttachFiles={onAttachFiles} />);

    expect(fireEvent.dragOver(getTextarea(), { dataTransfer: fileTransfer([image]) })).toBe(true);
    expect(fireEvent.drop(getTextarea(), { dataTransfer: fileTransfer([image]) })).toBe(true);
    expect(fireEvent.paste(getTextarea(), { clipboardData: clipboard([image]) })).toBe(true);
    expect(onAttachFiles).not.toHaveBeenCalled();
  });

  test('pasting a screenshot adds it once and keeps the draft text', () => {
    const onAttachFiles = vi.fn();
    const onValueChange = vi.fn();
    render(
      <CommentInput
        onSubmit={vi.fn()}
        attachmentsEnabled={true}
        onAttachFiles={onAttachFiles}
        value="look at this"
        onValueChange={onValueChange}
      />
    );

    expect(fireEvent.paste(getTextarea(), { clipboardData: clipboard([image]) })).toBe(false);

    expect(onAttachFiles).toHaveBeenCalledTimes(1);
    expect(onAttachFiles).toHaveBeenCalledWith([image]);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(getTextarea()).toHaveValue('look at this');
  });

  test('an image paste does not reach document-level paste handlers (react-mentions)', () => {
    const documentPaste = vi.fn();
    document.addEventListener('paste', documentPaste);
    try {
      render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} onAttachFiles={vi.fn()} />);
      fireEvent.paste(getTextarea(), { clipboardData: clipboard([image]) });
      expect(documentPaste).not.toHaveBeenCalled();

      fireEvent.paste(getTextarea(), { clipboardData: clipboard([], ['text/plain']) });
      expect(documentPaste).toHaveBeenCalledTimes(1);
    } finally {
      document.removeEventListener('paste', documentPaste);
    }
  });

  test('ordinary text paste is left to the textarea', () => {
    const onAttachFiles = vi.fn();
    render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} onAttachFiles={onAttachFiles} />);

    expect(fireEvent.paste(getTextarea(), { clipboardData: clipboard([], ['text/plain', 'text/html']) })).toBe(true);
    expect(onAttachFiles).not.toHaveBeenCalled();
  });

  test('rich text copied with a bitmap (Office) pastes as text', () => {
    const onAttachFiles = vi.fn();
    render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} onAttachFiles={onAttachFiles} />);

    const officeClipboard = clipboard([image], ['text/plain', 'text/html', 'text/rtf', 'Files']);
    expect(fireEvent.paste(getTextarea(), { clipboardData: officeClipboard })).toBe(true);
    expect(onAttachFiles).not.toHaveBeenCalled();
  });

  test('while a send is in flight a pasted image is not consumed', () => {
    const onAttachFiles = vi.fn();
    render(<CommentInput onSubmit={vi.fn()} disabled={true} attachmentsEnabled={true} onAttachFiles={onAttachFiles} />);

    expect(fireEvent.paste(getTextarea(), { clipboardData: clipboard([image]) })).toBe(true);
    expect(onAttachFiles).not.toHaveBeenCalled();
  });
});

// iOS Safari zooms the page in on focus when a field's text is under 16px. The
// composer (chat and comments) must use 16px text on iOS; jsdom does not
// apply Tailwind, so the classes are what is asserted.
describe('CommentInput iOS font size', () => {
  test('plain textarea uses 16px text on iOS', () => {
    render(<CommentInput onSubmit={vi.fn()} />);

    expect(getTextarea()).toHaveClass('text-body', 'ios:text-base');
  });

  test('mentions textarea inherits 16px text on iOS from its wrapper', () => {
    render(<CommentInput onSubmit={vi.fn()} mentionSearch={vi.fn()} />);

    const wrapper = getTextarea().closest('.ios\\:text-base');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass('text-body');
  });
});

// jsdom has no layout, so the input and dialog rects are stubbed and the inline
// style is what is asserted. The numbers below follow from the input's top: the
// list's bottom edge sits 4px above it, and the list never reaches the top 72px,
// where the site and dialog headers paint over it.
describe('CommentInput mention list placement', () => {
  const stubTop = (element: Element, top: number, bottom = top + 30) =>
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top, bottom } as DOMRect);
  const mentionSearch = vi.fn(async () => [{ id: 'u1', displayName: 'Neil' }]);

  const openList = async () => {
    fireEvent.change(getTextarea(), { target: { value: '@ne', selectionStart: 3, selectionEnd: 3 } });
    // react-mentions runs the query from the select event a real keystroke also fires.
    fireEvent.select(getTextarea());
    const name = await screen.findByText('Neil');
    return name.closest('.overflow-y-auto') as HTMLElement;
  };

  beforeEach(() => {
    screenSize.isSmallScreen = true;
  });

  afterEach(() => {
    screenSize.isSmallScreen = false;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('on a small screen the list is anchored from the input top, not from 100vh', async () => {
    stubTop(HTMLTextAreaElement.prototype, 400);
    render(<CommentInput onSubmit={vi.fn()} mentionSearch={mentionSearch} />);

    const { style } = await openList();

    expect(style.position).toBe('fixed');
    expect(style.top).toBe('396px');
    expect(style.transform).toBe('translateY(-100%)');
    expect(style.bottom).toBe('');
    expect(style.cssText).not.toContain('vh');
  });

  test('inside a dialog the anchor is converted to the dialog coordinates, without a portal', async () => {
    stubTop(HTMLTextAreaElement.prototype, 500);
    const { container } = render(
      <div data-slot="dialog-content">
        <CommentInput onSubmit={vi.fn()} mentionSearch={mentionSearch} />
      </div>
    );
    const dialog = container.querySelector('[data-slot="dialog-content"]') as HTMLElement;
    stubTop(dialog, 100);

    const list = await openList();

    expect(list.style.top).toBe('396px');
    expect(dialog).toContainElement(list);
  });

  test('with room above the input the list keeps its full height', async () => {
    stubTop(HTMLTextAreaElement.prototype, 500);
    render(<CommentInput onSubmit={vi.fn()} mentionSearch={mentionSearch} />);

    const { style } = await openList();

    expect(style.maxHeight).toBe('min(14rem, 424px)');
  });

  test('with little room above the input the list opens below it, clear of the text', async () => {
    stubTop(HTMLTextAreaElement.prototype, 170);
    vi.stubGlobal('visualViewport', { offsetTop: 0, height: 500 });
    render(<CommentInput onSubmit={vi.fn()} mentionSearch={mentionSearch} />);

    const { style } = await openList();

    expect(style.top).toBe('204px');
    expect(style.transform).toBe('');
    expect(style.maxHeight).toBe('min(14rem, 292px)');
  });

  test('below the input, the list height stops at the keyboard inside a dialog too', async () => {
    stubTop(HTMLTextAreaElement.prototype, 120);
    vi.stubGlobal('visualViewport', { offsetTop: 40, height: 300 });
    const { container } = render(
      <div data-slot="dialog-content">
        <CommentInput onSubmit={vi.fn()} mentionSearch={mentionSearch} />
      </div>
    );
    stubTop(container.querySelector('[data-slot="dialog-content"]') as HTMLElement, 20, 800);

    const { style } = await openList();

    expect(style.top).toBe('134px');
    expect(style.maxHeight).toBe('min(14rem, 182px)');
  });

  test.each([
    [220, '216px', 'translateY(-100%)'],
    [219, '253px', ''],
  ])('with the input at %ipx the list needs 144px above it to open there', async (top, listTop, transform) => {
    stubTop(HTMLTextAreaElement.prototype, top);
    vi.stubGlobal('visualViewport', { offsetTop: 0, height: 844 });
    render(<CommentInput onSubmit={vi.fn()} mentionSearch={mentionSearch} />);

    const { style } = await openList();

    expect(style.top).toBe(listTop);
    expect(style.transform).toBe(transform);
  });

  test('a tall input with the keyboard up leaves more room above, so the list stays there', async () => {
    stubTop(HTMLTextAreaElement.prototype, 180, 300);
    vi.stubGlobal('visualViewport', { offsetTop: 0, height: 300 });
    render(<CommentInput onSubmit={vi.fn()} mentionSearch={mentionSearch} />);

    const { style } = await openList();

    expect(style.top).toBe('176px');
    expect(style.transform).toBe('translateY(-100%)');
    expect(style.maxHeight).toBe('min(14rem, 104px)');
  });

  test('room above is measured from the visible area when iOS has panned the page', async () => {
    stubTop(HTMLTextAreaElement.prototype, 300, 332);
    vi.stubGlobal('visualViewport', { offsetTop: 250, height: 332 });
    render(<CommentInput onSubmit={vi.fn()} mentionSearch={mentionSearch} />);

    const { style } = await openList();

    expect(style.top).toBe('336px');
    expect(style.transform).toBe('');
    expect(style.maxHeight).toBe('min(14rem, 242px)');
  });

  test('below the input, a short dialog limits the list height so it is not clipped', async () => {
    stubTop(HTMLTextAreaElement.prototype, 422);
    vi.stubGlobal('visualViewport', { offsetTop: 0, height: 844 });
    const { container } = render(
      <div data-slot="dialog-content">
        <CommentInput onSubmit={vi.fn()} mentionSearch={mentionSearch} />
      </div>
    );
    stubTop(container.querySelector('[data-slot="dialog-content"]') as HTMLElement, 272, 572);

    const { style } = await openList();

    expect(style.top).toBe('184px');
    expect(style.maxHeight).toBe('min(14rem, 112px)');
  });

  test('on a small screen the list wrapper sits above the z-10 links in a post', async () => {
    stubTop(HTMLTextAreaElement.prototype, 400);
    render(<CommentInput onSubmit={vi.fn()} mentionSearch={mentionSearch} />);

    const list = await openList();

    expect(list.parentElement?.style.zIndex).toBe('30');
  });

  test('from 640px up the list has no inline positioning', async () => {
    screenSize.isSmallScreen = false;
    render(<CommentInput onSubmit={vi.fn()} mentionSearch={mentionSearch} />);

    const list = await openList();

    expect(list.getAttribute('style')).toBeNull();
    expect(list).toHaveClass('max-h-72', 'w-72');
    expect(list.parentElement?.style.zIndex).toBe('1');
  });
});
