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

describe('CalloutDetailDialog — post title below 640px', () => {
  const titled = { ...callout, title: 'A long post title' };

  it('keeps the header title from showing on a phone, while it still names the dialog', () => {
    render(<CalloutDetailDialog open={true} onOpenChange={vi.fn()} callout={titled} {...slots} />);

    expect(screen.getByRole('dialog', { name: titled.title })).toBeInTheDocument();

    const headerTitle = screen.getByRole('heading', { level: 2, name: titled.title });
    expect(headerTitle).toHaveClass('max-sm:sr-only');
    // Desktop stays as it is: a plain or `not-sr-only` class would change the 640px+ render.
    expect(headerTitle).toHaveClass('truncate');
    expect(headerTitle).not.toHaveClass('sr-only');
    expect(headerTitle.className).not.toContain('not-sr-only');
  });

  it('leaves the full-text body title visible at every width', () => {
    render(<CalloutDetailDialog open={true} onOpenChange={vi.fn()} callout={titled} {...slots} />);

    const bodyTitle = screen.getByRole('heading', { level: 1, name: titled.title });
    expect(bodyTitle.className).not.toContain('sr-only');
    expect(bodyTitle.className).not.toContain('hidden');
  });

  it('does not change focused mode, where the title is screen-reader-only at every width', () => {
    render(<CalloutDetailDialog open={true} onOpenChange={vi.fn()} callout={titled} focusedPost={true} {...slots} />);

    expect(screen.getByRole('dialog', { name: titled.title })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();

    const title = screen.getByRole('heading', { level: 2, name: titled.title });
    expect(title).toHaveClass('sr-only');
    expect(title).not.toHaveClass('max-sm:sr-only');
  });
});
