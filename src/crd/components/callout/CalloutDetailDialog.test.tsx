import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutDetailDialog } from './CalloutDetailDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const callout = {
  id: 'c1',
  title: 'A callout',
  commentCount: 3,
};

const slots = {
  commentsSlot: <div data-testid="thread">thread</div>,
  commentInputSlot: <div data-testid="comment-input">input</div>,
};

describe('CalloutDetailDialog — discussion while an edit form is open', () => {
  it('hides the comment surface while editing, and restores it with the same count afterwards', () => {
    const { rerender } = render(
      <CalloutDetailDialog open={true} onOpenChange={vi.fn()} callout={callout} editing={true} {...slots} />
    );

    // Writing, not discussing: neither the thread nor the comment box is on screen.
    expect(screen.queryByTestId('thread')).not.toBeInTheDocument();
    expect(screen.queryByTestId('comment-input')).not.toBeInTheDocument();
    expect(screen.queryByText('calloutDialog.discussion')).not.toBeInTheDocument();

    // Save / cancel closes the edit form: the surface comes back, count untouched.
    rerender(<CalloutDetailDialog open={true} onOpenChange={vi.fn()} callout={callout} editing={false} {...slots} />);

    expect(screen.getByTestId('thread')).toBeInTheDocument();
    expect(screen.getByTestId('comment-input')).toBeInTheDocument();
    expect(screen.getByText('calloutDialog.discussion')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows the comment surface when no edit form is open', () => {
    render(<CalloutDetailDialog open={true} onOpenChange={vi.fn()} callout={callout} {...slots} />);

    expect(screen.getByTestId('thread')).toBeInTheDocument();
    expect(screen.getByText('calloutDialog.discussion')).toBeInTheDocument();
  });
});
