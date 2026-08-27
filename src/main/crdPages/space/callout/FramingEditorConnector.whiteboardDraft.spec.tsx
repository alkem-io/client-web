/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { FramingEditorConnector } from './FramingEditorConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/domain/collaboration/whiteboard/WhiteboardDraft/WhiteboardDraftEditor', () => ({
  WhiteboardDraftEditor: () => null,
}));

const renderWhiteboardFraming = (materialize: () => Promise<undefined>) =>
  render(
    <FramingEditorConnector
      framingType="whiteboard"
      linkUrl=""
      onLinkUrlChange={vi.fn()}
      linkDisplayName=""
      onLinkDisplayNameChange={vi.fn()}
      pollQuestion=""
      onPollQuestionChange={vi.fn()}
      pollOptions={[]}
      onPollOptionsChange={vi.fn()}
      mediaGalleryVisuals={[]}
      onMediaGalleryVisualsChange={vi.fn()}
      collaboraDocumentType={CollaboraDocumentType.Wordprocessing}
      onCollaboraDocumentTypeChange={vi.fn()}
      whiteboardDraft={{
        handle: undefined,
        loading: false,
        materialize,
        preparationRef: { current: null },
        prepareForConsumption: vi.fn().mockResolvedValue(true),
        prepared: vi.fn(),
        discard: vi.fn().mockResolvedValue(true),
        consumed: vi.fn(),
      }}
    />
  );

describe('FramingEditorConnector whiteboard draft UX', () => {
  it('keeps the legacy clickable preview and materializes only after Edit is requested', () => {
    const materialize = vi.fn().mockResolvedValue(undefined);
    renderWhiteboardFraming(materialize);

    const editTargets = screen.getAllByRole('button', { name: 'framing.edit' });
    expect(editTargets).toHaveLength(2);
    expect(materialize).not.toHaveBeenCalled();

    fireEvent.click(editTargets[0]);
    expect(materialize).toHaveBeenCalledOnce();
  });
});
