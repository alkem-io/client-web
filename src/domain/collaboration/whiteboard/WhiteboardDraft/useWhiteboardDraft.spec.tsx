import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WhiteboardDraftHandle } from './useWhiteboardDraft';
import { useWhiteboardDraft } from './useWhiteboardDraft';

const createOnCalloutsSet = vi.fn();
const createOnTemplatesSet = vi.fn();
const deleteDraft = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateWhiteboardDraftOnCalloutsSetMutation: () => [createOnCalloutsSet],
  useCreateWhiteboardDraftOnTemplatesSetMutation: () => [createOnTemplatesSet],
  useDeleteWhiteboardDraftMutation: () => [deleteDraft],
}));

const persisted: WhiteboardDraftHandle = {
  whiteboardID: '441d908f-b51a-4af5-a24e-414e5c428ecf',
  sourceKey: ':',
};

describe('useWhiteboardDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createOnCalloutsSet.mockResolvedValue({
      data: {
        createWhiteboardDraftOnCalloutsSet: persisted.whiteboardID,
      },
    });
    deleteDraft.mockResolvedValue({ data: { deleteWhiteboardDraft: persisted.whiteboardID } });
  });

  it('does not create a draft until editing is explicitly requested', () => {
    renderHook(() =>
      useWhiteboardDraft({
        scope: { type: 'calloutsSet', id: 'e578f237-1a63-49ef-ab63-f35254429e64' },
        onHandleChange: vi.fn(),
      })
    );

    expect(createOnCalloutsSet).not.toHaveBeenCalled();
    expect(createOnTemplatesSet).not.toHaveBeenCalled();
  });

  it('materializes by identifiers only and coalesces concurrent requests', async () => {
    const onHandleChange = vi.fn();
    const { result } = renderHook(() =>
      useWhiteboardDraft({
        scope: { type: 'calloutsSet', id: 'e578f237-1a63-49ef-ab63-f35254429e64' },
        onHandleChange,
      })
    );

    await act(async () => {
      const [first, second] = await Promise.all([result.current.materialize(), result.current.materialize()]);
      expect(first?.whiteboardID).toBe(persisted.whiteboardID);
      expect(second?.whiteboardID).toBe(persisted.whiteboardID);
    });

    expect(createOnCalloutsSet).toHaveBeenCalledOnce();
    const draftData = createOnCalloutsSet.mock.calls[0][0].variables.draftData;
    expect(draftData).toMatchObject({ calloutsSetID: 'e578f237-1a63-49ef-ab63-f35254429e64' });
    expect(draftData).not.toHaveProperty('content');
    expect(draftData).not.toHaveProperty('yjs');
    expect(onHandleChange).toHaveBeenCalledWith(persisted);
  });

  it('does not create anything without an owning scope id', async () => {
    const { result } = renderHook(() =>
      useWhiteboardDraft({
        scope: { type: 'templatesSet' },
        onHandleChange: vi.fn(),
      })
    );

    let materialized: WhiteboardDraftHandle | undefined;
    await act(async () => {
      materialized = await result.current.materialize();
    });
    expect(materialized).toBeUndefined();
    expect(createOnTemplatesSet).not.toHaveBeenCalled();
  });

  it('keeps the handle when explicit cleanup fails', async () => {
    deleteDraft.mockRejectedValueOnce(new Error('unavailable'));
    const onHandleChange = vi.fn();
    const { result } = renderHook(() =>
      useWhiteboardDraft({
        scope: { type: 'calloutsSet', id: '9d49e682-d9c2-4eb6-8f0a-578c8a435b16' },
        handle: persisted,
        onHandleChange,
      })
    );

    let discarded = true;
    await act(async () => {
      discarded = await result.current.discard();
    });
    expect(discarded).toBe(false);
    expect(onHandleChange).not.toHaveBeenCalledWith(undefined);
  });

  it('explicit cleanup sends the draft Whiteboard id', async () => {
    const onHandleChange = vi.fn();
    const { result } = renderHook(() =>
      useWhiteboardDraft({
        scope: { type: 'calloutsSet', id: '6c46a115-86e9-4c7d-a35b-3e9748158466' },
        handle: persisted,
        onHandleChange,
      })
    );

    await act(async () => {
      await result.current.discard();
    });

    expect(deleteDraft).toHaveBeenCalledWith({ variables: { whiteboardID: persisted.whiteboardID } });
    expect(onHandleChange).toHaveBeenCalledWith(undefined);
  });

  it('never calls delete when there is no draft handle', async () => {
    const { result } = renderHook(() =>
      useWhiteboardDraft({
        scope: { type: 'calloutsSet', id: 'bc91c40d-f58d-49af-9618-e482fa77c415' },
        onHandleChange: vi.fn(),
      })
    );

    let discarded = false;
    await act(async () => {
      discarded = await result.current.discard();
    });
    expect(discarded).toBe(true);
    expect(deleteDraft).not.toHaveBeenCalled();
  });

  it('waits for in-flight materialization before explicit discard', async () => {
    let resolveCreate: ((value: unknown) => void) | undefined;
    createOnCalloutsSet.mockReturnValueOnce(
      new Promise(resolve => {
        resolveCreate = resolve;
      })
    );
    const onHandleChange = vi.fn();
    const { result } = renderHook(() =>
      useWhiteboardDraft({
        scope: { type: 'calloutsSet', id: 'bc91c40d-f58d-49af-9618-e482fa77c415' },
        onHandleChange,
      })
    );

    await act(async () => {
      const materializing = result.current.materialize();
      const discarding = result.current.discard();
      resolveCreate?.({
        data: { createWhiteboardDraftOnCalloutsSet: persisted.whiteboardID },
      });
      await materializing;
      await discarding;
    });

    expect(deleteDraft).toHaveBeenCalledWith({ variables: { whiteboardID: persisted.whiteboardID } });
    expect(onHandleChange).toHaveBeenLastCalledWith(undefined);
  });

  it('retains a newly materialized handle until the parent commits it', async () => {
    const onHandleChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ handle }: { handle?: WhiteboardDraftHandle }) =>
        useWhiteboardDraft({
          scope: { type: 'calloutsSet', id: '80c59089-c435-45ae-9862-fda57c0a5a35' },
          handle,
          onHandleChange,
        }),
      { initialProps: { handle: undefined as WhiteboardDraftHandle | undefined } }
    );

    await act(async () => {
      await result.current.materialize();
    });
    rerender({ handle: undefined });
    await act(async () => {
      await result.current.discard();
    });

    expect(deleteDraft).toHaveBeenCalledWith({ variables: { whiteboardID: persisted.whiteboardID } });
  });
});
