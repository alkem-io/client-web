/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { ResponseDefaultsDialog } from './ResponseDefaultsDialog';

const whiteboardDefaults = {
  defaultDisplayName: '',
  postDescription: '',
  whiteboardContentAvailable: true,
  sourceWhiteboardId: 'source-whiteboard',
  sourceCalloutId: 'source-callout',
  clearWhiteboardContent: false,
};

describe('ResponseDefaultsDialog whiteboard source metadata', () => {
  it('clears both mutually exclusive source identifiers before saving', () => {
    const onSave = vi.fn();

    render(
      <ResponseDefaultsDialog
        open={true}
        onOpenChange={vi.fn()}
        type="whiteboard"
        values={whiteboardDefaults}
        onSave={onSave}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'responseDefaults.clearWhiteboard' }));
    fireEvent.click(screen.getByRole('button', { name: 'responseDefaults.save' }));

    expect(onSave).toHaveBeenCalledWith({
      ...whiteboardDefaults,
      sourceWhiteboardId: undefined,
      sourceCalloutId: undefined,
      whiteboardContentAvailable: false,
      clearWhiteboardContent: true,
    });
  });

  it('treats a sourceCalloutId-only draft change as dirty', () => {
    const onOpenChange = vi.fn();

    render(
      <ResponseDefaultsDialog
        open={true}
        onOpenChange={onOpenChange}
        type="whiteboard"
        values={whiteboardDefaults}
        onSave={vi.fn()}
        templateSlot={({ applyDraft }) => (
          <button type="button" onClick={() => applyDraft({ sourceCalloutId: 'replacement-callout' })}>
            apply-source-callout
          </button>
        )}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'apply-source-callout' }));
    fireEvent.click(screen.getByRole('button', { name: 'dialogs.cancel' }));

    expect(screen.getByText('dialogs.discardChanges.title')).toBeTruthy();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
