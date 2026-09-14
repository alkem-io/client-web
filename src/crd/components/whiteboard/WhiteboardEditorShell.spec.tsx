import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WhiteboardEditorShell } from './WhiteboardEditorShell';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('WhiteboardEditorShell', () => {
  it('associates the whiteboard title with the dialog', () => {
    render(
      <WhiteboardEditorShell open={true} onClose={vi.fn()} title="Planning board">
        <div>Canvas</div>
      </WhiteboardEditorShell>
    );

    const dialog = screen.getByRole('dialog', { name: 'Planning board' });
    const titleId = dialog.getAttribute('aria-labelledby');

    expect(titleId).toBeTruthy();
    if (!titleId) throw new Error('Expected the dialog to reference its title');
    expect(document.getElementById(titleId)).toHaveAttribute('data-slot', 'dialog-title');
  });
});
