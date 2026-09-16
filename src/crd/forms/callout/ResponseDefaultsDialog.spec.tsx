/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('offers the authoring slot and Clear together once a default exists', () => {
    render(
      <ResponseDefaultsDialog
        open={true}
        onOpenChange={vi.fn()}
        type="whiteboard"
        values={whiteboardDefaults}
        onSave={vi.fn()}
        whiteboardSlot={() => <button type="button">open-whiteboard</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'open-whiteboard' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'responseDefaults.clearWhiteboard' })).toBeTruthy();
  });

  it('drops a materialized draft when the default is cleared', () => {
    const onSave = vi.fn();
    const onWhiteboardCleared = vi.fn();

    render(
      <ResponseDefaultsDialog
        open={true}
        onOpenChange={vi.fn()}
        type="whiteboard"
        values={{
          ...whiteboardDefaults,
          whiteboardDraft: { whiteboardID: 'draft-1', sourceKey: ':source-callout' },
        }}
        onSave={onSave}
        whiteboardSlot={() => null}
        onWhiteboardCleared={onWhiteboardCleared}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'responseDefaults.clearWhiteboard' }));
    fireEvent.click(screen.getByRole('button', { name: 'responseDefaults.save' }));

    expect(onWhiteboardCleared).toHaveBeenCalledOnce();
    // A retained handle would be sent as draftWhiteboardID and silently outrank
    // clearWhiteboardContent in both submit mappers, so the clear would be lost.
    expect(onSave.mock.calls[0][0]).toMatchObject({
      whiteboardDraft: undefined,
      whiteboardContentAvailable: false,
      clearWhiteboardContent: true,
    });
  });

  it('keeps the dialog open when explicit draft cleanup fails', async () => {
    const onOpenChange = vi.fn();
    const onCancel = vi.fn().mockResolvedValue(false);

    render(
      <ResponseDefaultsDialog
        open={true}
        onOpenChange={onOpenChange}
        type="whiteboard"
        values={whiteboardDefaults}
        onSave={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'dialogs.cancel' }));

    await waitFor(() => expect(onCancel).toHaveBeenCalledOnce());
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
