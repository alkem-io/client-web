import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, useState } from 'react';
import { describe, expect, test, vi } from 'vitest';
import type { ComposerAttachment } from './types';

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

    test('busy sending disables retry and removal', () => {
      render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} attachments={[failed]} disabled={true} />);
      expect(screen.getByRole('button', { name: 'comments.send' })).toBeDisabled();
      expect(screen.getByRole('button', { name: /comments.attachments.removeAttachment/ })).toBeDisabled();
    });
  });
});
