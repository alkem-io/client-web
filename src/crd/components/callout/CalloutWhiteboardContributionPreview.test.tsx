import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutWhiteboardContributionPreview } from './CalloutWhiteboardContributionPreview';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const whiteboard = {
  id: 'wb1',
  title: 'My whiteboard',
  author: { name: 'Alice' },
};

describe('CalloutWhiteboardContributionPreview — delete affordance', () => {
  it('renders the trash button before close and forwards the click to onDelete', () => {
    const onDelete = vi.fn();
    render(
      <CalloutWhiteboardContributionPreview
        whiteboard={whiteboard}
        onOpen={vi.fn()}
        onDelete={onDelete}
        onClose={vi.fn()}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'whiteboardPreview.delete' });
    const closeButton = screen.getByRole('button', { name: 'whiteboardPreview.close' });
    expect(deleteButton.compareDocumentPosition(closeButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    deleteButton.click();
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('omits the trash button when onDelete is not wired (no delete privilege)', () => {
    render(<CalloutWhiteboardContributionPreview whiteboard={whiteboard} onOpen={vi.fn()} onClose={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'whiteboardPreview.delete' })).not.toBeInTheDocument();
  });
});
