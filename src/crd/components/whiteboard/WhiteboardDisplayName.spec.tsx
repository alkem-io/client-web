import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WhiteboardDisplayName } from './WhiteboardDisplayName';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('WhiteboardDisplayName', () => {
  it('cancels a rename without saving it', () => {
    const onCancel = vi.fn();
    const onSave = vi.fn();

    render(
      <WhiteboardDisplayName
        displayName="Canonical title"
        value="Unsaved title"
        editing={true}
        onCancel={onCancel}
        onSave={onSave}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'editor.cancelEdit' }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });
});
