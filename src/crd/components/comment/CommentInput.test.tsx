import { fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
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
