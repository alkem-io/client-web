/** @vitest-environment jsdom */
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { useMemoSigningFlow } from '@/main/crdPages/memo/useMemoSigningFlow';
import { FramingEditorConnector } from './FramingEditorConnector';

const memoDialogState = vi.hoisted(() => ({ props: undefined as Record<string, unknown> | undefined }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/domain/collaboration/whiteboard/WhiteboardDraft/WhiteboardDraftEditor', () => ({
  WhiteboardDraftEditor: () => null,
}));
vi.mock('@/main/crdPages/memo/CrdMemoDialog', () => ({
  CrdMemoDialog: (props: Record<string, unknown>) => {
    memoDialogState.props = props;
    return props.open ? <div data-testid="memo-dialog" /> : null;
  },
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

  it('carries the exact framing origin through continuation, one allowlisted store, and navigation', async () => {
    render(
      <FramingEditorConnector
        mode="edit"
        calloutId="callout-1"
        editMemoId="memo-1"
        framingType="memo"
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
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'framing.openMemo' }));

    expect(screen.getByTestId('memo-dialog')).toBeInTheDocument();
    expect(memoDialogState.props).toEqual(
      expect.objectContaining({
        memoId: 'memo-1',
        signingOrigin: { kind: 'framing', calloutId: 'callout-1' },
      })
    );

    const continuationOrder: string[] = [];
    let resolveContinuation!: (url: string) => void;
    const continueSigning = vi.fn(
      () =>
        new Promise<string>(resolve => {
          resolveContinuation = url => {
            continuationOrder.push('continue-resolved');
            resolve(url);
          };
        })
    );
    const navigate = vi.fn(() => continuationOrder.push('navigate'));
    const storagePrototype = Object.getPrototypeOf(window.sessionStorage) as Storage;
    const originalSetItem = storagePrototype.setItem;
    const setItem = vi.spyOn(storagePrototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      continuationOrder.push('store');
      return originalSetItem.call(this, key, value);
    });
    const origin = memoDialogState.props?.signingOrigin as {
      kind: 'framing';
      calloutId: string;
    };
    const { result } = renderHook(() =>
      useMemoSigningFlow({
        memoId: memoDialogState.props?.memoId as string,
        requestDurability: vi.fn(),
        prepare: () => Promise.resolve({ attemptId: 'attempt-1', previewUrl: '/snapshot/attempt-1' }),
        continueSigning,
        navigate,
        returnContext: { userId: 'user-1', memoId: memoDialogState.props?.memoId as string, ...origin },
      })
    );

    await act(() => result.current.prepare());
    let continuation!: Promise<void>;
    act(() => {
      continuation = result.current.continueSigning();
    });
    expect(setItem).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();

    await act(async () => {
      resolveContinuation('https://cleverbase.example/authorize');
      await continuation;
    });

    expect(setItem).toHaveBeenCalledOnce();
    expect(JSON.parse(setItem.mock.calls[0]?.[1] ?? '{}')).toEqual({
      version: 1,
      expiresAt: expect.any(Number),
      attemptId: 'attempt-1',
      userId: 'user-1',
      memoId: 'memo-1',
      kind: 'framing',
      calloutId: 'callout-1',
    });
    expect(continuationOrder).toEqual(['continue-resolved', 'store', 'navigate']);
    setItem.mockRestore();
  });
});
