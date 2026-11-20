import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentProps, useState } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { Dialog, DialogContent, DialogTitle } from '@/crd/primitives/dialog';
import { ChatPanel } from './ChatPanel';

vi.mock('@/crd/hooks/useMediaQuery', () => ({
  useScreenSize: () => ({ isSmallScreen: false, isMediumScreen: false, isLargeScreen: true }),
}));

const chatProps: Omit<ComponentProps<typeof ChatPanel>, 'open' | 'children'> = {
  title: 'Ada Lovelace',
  onClose: () => {},
  closeLabel: 'Close chat',
  backLabel: 'Back to conversations',
  settingsLabel: 'Notification settings',
  muteSoundLabel: 'Mute chat sound',
  unmuteSoundLabel: 'Unmute chat sound',
  expandLabel: 'Expand chat',
  collapseLabel: 'Collapse chat',
};

// A page modal (the callout dialog) whose content has a Message action that opens the chat.
const ModalThenChat = ({ chatOpenInitially = false }: { chatOpenInitially?: boolean }) => {
  const [chatOpen, setChatOpen] = useState(chatOpenInitially);
  const [dialogOpen, setDialogOpen] = useState(true);
  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Our contributors</DialogTitle>
          <button type="button" onClick={() => setChatOpen(true)}>
            Message
          </button>
        </DialogContent>
      </Dialog>
      <ChatPanel {...chatProps} open={chatOpen}>
        <div data-testid="thread" className="overflow-y-auto">
          <textarea aria-label="Write a message" />
        </div>
      </ChatPanel>
    </>
  );
};

const flushRadixListeners = () =>
  act(async () => {
    // Radix registers its outside-pointer listener on the next tick.
    await new Promise(resolve => setTimeout(resolve, 0));
  });

afterEach(() => {
  document.body.style.pointerEvents = '';
});

test('a chat opened from inside a modal is visible to assistive technology and stacked above it', async () => {
  const user = userEvent.setup();
  render(<ModalThenChat />);

  await user.click(screen.getByRole('button', { name: 'Message' }));

  const chat = screen.getByRole('dialog', { name: 'Ada Lovelace' });
  expect(chat.closest('[aria-hidden="true"]')).toBeNull();
  const modal = screen.getByRole('dialog', { name: 'Our contributors' });
  // Same z-index, so the later node in the document paints on top.
  expect(modal.compareDocumentPosition(chat) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test('the chat receives pointer events although the modal disables them on the page', async () => {
  const user = userEvent.setup();
  render(<ModalThenChat />);
  await user.click(screen.getByRole('button', { name: 'Message' }));

  expect(document.body.style.pointerEvents).toBe('none');
  expect(screen.getByRole('dialog', { name: 'Ada Lovelace', hidden: true })).toHaveClass('pointer-events-auto');
});

test('the composer keeps focus: the modal no longer pulls focus back into itself', async () => {
  const user = userEvent.setup();
  render(<ModalThenChat />);
  await user.click(screen.getByRole('button', { name: 'Message' }));
  await flushRadixListeners();

  const composer = screen.getByRole('textbox', { name: 'Write a message', hidden: true });
  act(() => composer.focus());

  expect(composer).toHaveFocus();
});

test('a pointer press in the chat does not dismiss the modal underneath', async () => {
  const user = userEvent.setup();
  render(<ModalThenChat />);
  await user.click(screen.getByRole('button', { name: 'Message' }));
  await flushRadixListeners();

  fireEvent.pointerDown(screen.getByRole('textbox', { name: 'Write a message', hidden: true }));

  expect(screen.getByRole('dialog', { name: 'Our contributors' })).toBeInTheDocument();
});

test('the modal scroll lock does not swallow wheel scrolling inside the chat', async () => {
  const user = userEvent.setup();
  render(<ModalThenChat />);
  await user.click(screen.getByRole('button', { name: 'Message' }));

  const thread = screen.getByTestId('thread');
  Object.defineProperties(thread, {
    scrollHeight: { configurable: true, value: 1000 },
    clientHeight: { configurable: true, value: 200 },
    scrollTop: { configurable: true, value: 300, writable: true },
  });
  const wheel = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 50 });
  act(() => {
    thread.dispatchEvent(wheel);
  });

  expect(wheel.defaultPrevented).toBe(false);
});

// The chat was already open when a dialog opened over it; Message in that dialog
// is a new open request, which the host answers with a fresh mount of the panel.
const ChatThenModal = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openRequest, setOpenRequest] = useState(0);
  return (
    <>
      <button type="button" onClick={() => setDialogOpen(true)}>
        Open post
      </button>
      <ChatPanel key={openRequest} {...chatProps} open={true}>
        <textarea aria-label="Write a message" />
      </ChatPanel>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Our contributors</DialogTitle>
          <button type="button" onClick={() => setOpenRequest(count => count + 1)}>
            Message
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
};

test('a dialog opened over the chat covers it, and a new open request brings the chat back above that dialog', async () => {
  const user = userEvent.setup();
  render(<ChatThenModal />);
  await user.click(screen.getByRole('button', { name: 'Open post' }));

  expect(screen.queryByRole('dialog', { name: 'Ada Lovelace' })).toBeNull();

  await user.click(screen.getByRole('button', { name: 'Message' }));
  await flushRadixListeners();

  const chat = screen.getByRole('dialog', { name: 'Ada Lovelace' });
  const modal = screen.getByRole('dialog', { name: 'Our contributors' });
  expect(modal.compareDocumentPosition(chat) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  const composer = screen.getByRole('textbox', { name: 'Write a message' });
  act(() => composer.focus());
  expect(composer).toHaveFocus();
});

test('on touch, closing the chat leaves the dialog underneath open', async () => {
  // On touch Radix defers its outside-press check from pointerdown to the following click,
  // by which time the tap on the chat's close button has already removed the chat.
  const Host = ({ chatOpen }: { chatOpen: boolean }) => (
    <>
      <Dialog defaultOpen={true}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Our contributors</DialogTitle>
        </DialogContent>
      </Dialog>
      <ChatPanel {...chatProps} open={chatOpen}>
        <div />
      </ChatPanel>
    </>
  );
  const { rerender } = render(<Host chatOpen={true} />);
  await flushRadixListeners();

  const close = screen.getByRole('button', { name: 'Close chat', hidden: true });
  const touchDown = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
  Object.defineProperty(touchDown, 'pointerType', { value: 'touch' });
  act(() => {
    close.dispatchEvent(touchDown);
  });
  rerender(<Host chatOpen={false} />);
  act(() => {
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  expect(screen.getByRole('dialog', { name: 'Our contributors' })).toBeInTheDocument();
});

test('on touch, stepping back from a thread to the list leaves the dialog underneath open', async () => {
  // Back removes the back button itself, so the press's own element is gone by the click.
  const Host = ({ inThread }: { inThread: boolean }) => (
    <>
      <Dialog defaultOpen={true}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Our contributors</DialogTitle>
        </DialogContent>
      </Dialog>
      <ChatPanel {...chatProps} open={true} onBack={inThread ? () => {} : undefined}>
        <div />
      </ChatPanel>
    </>
  );
  const { rerender } = render(<Host inThread={true} />);
  await flushRadixListeners();

  const back = screen.getByRole('button', { name: 'Back to conversations', hidden: true });
  const touchDown = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
  Object.defineProperty(touchDown, 'pointerType', { value: 'touch' });
  act(() => {
    back.dispatchEvent(touchDown);
  });
  rerender(<Host inThread={false} />);
  act(() => {
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  expect(screen.getByRole('dialog', { name: 'Our contributors' })).toBeInTheDocument();
});
