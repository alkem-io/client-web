import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useRenameCollaboraDocument } from './useRenameCollaboraDocument';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const updateMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateCollaboraDocumentMutation: () => [updateMock, { loading: false }],
}));

const ID = 'doc-1';
const setup = (displayName = 'Budget', canRename = true) =>
  renderHook(() => useRenameCollaboraDocument({ collaboraDocumentId: ID, displayName, canRename }));

beforeEach(() => {
  updateMock.mockReset();
  updateMock.mockResolvedValue({});
});

describe('useRenameCollaboraDocument', () => {
  test('readOnly reflects canRename', () => {
    const { result } = setup('Budget', false);
    expect(result.current.readOnly).toBe(true);
  });

  test('valid rename persists via updateCollaboraDocument', async () => {
    const { result } = setup('Budget');
    act(() => result.current.startEdit());
    act(() => result.current.changeDraft('  Q1 Plan  '));
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.save();
    });
    expect(updateMock).toHaveBeenCalledWith({ variables: { updateData: { ID, displayName: 'Q1 Plan' } } });
    expect(ok).toBe(true);
    expect(result.current.editing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('unchanged name is a no-op (no mutation)', async () => {
    const { result } = setup('Budget');
    act(() => result.current.startEdit());
    await act(async () => {
      await result.current.save();
    });
    expect(updateMock).not.toHaveBeenCalled();
    expect(result.current.editing).toBe(false);
  });

  test.each([
    ['blank', '   '],
    ['too short', 'ab'],
    ['too long', 'x'.repeat(129)],
  ])('invalid name (%s) is rejected and not persisted', async (_label, value) => {
    const { result } = setup('Budget');
    act(() => result.current.startEdit());
    act(() => result.current.changeDraft(value));
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.save();
    });
    expect(updateMock).not.toHaveBeenCalled();
    expect(ok).toBe(false);
    expect(result.current.error).not.toBeNull();
  });

  test('save failure keeps the name and surfaces an error', async () => {
    updateMock.mockRejectedValueOnce(new Error('boom'));
    const { result } = setup('Budget');
    act(() => result.current.startEdit());
    act(() => result.current.changeDraft('New Title'));
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.save();
    });
    expect(ok).toBe(false);
    expect(result.current.error).toBe('collabora.rename.errors.saveFailed');
    // Still editing so the user can retry; persisted name unchanged.
    expect(result.current.editing).toBe(true);
  });

  test('cancel clears editing and error', () => {
    const { result } = setup('Budget');
    act(() => result.current.startEdit());
    act(() => result.current.cancel());
    expect(result.current.editing).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
