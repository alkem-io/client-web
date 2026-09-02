import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutPostPreview } from './CalloutPostPreview';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const post = {
  id: 'p1',
  title: 'My post',
  author: { name: 'Alice' },
};

describe('CalloutPostPreview — delete affordance', () => {
  it('renders the trash button before close and forwards the click to onDelete', () => {
    const onDelete = vi.fn();
    render(<CalloutPostPreview post={post} onDelete={onDelete} onClose={vi.fn()} />);

    const deleteButton = screen.getByRole('button', { name: 'postPreview.delete' });
    const closeButton = screen.getByRole('button', { name: 'postPreview.close' });
    // The trash sits before the close button in the action cluster.
    expect(deleteButton.compareDocumentPosition(closeButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    deleteButton.click();
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('omits the trash button when onDelete is not wired (no delete privilege)', () => {
    render(<CalloutPostPreview post={post} onClose={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'postPreview.delete' })).not.toBeInTheDocument();
  });
});
