import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VisualType } from '@/core/apollo/generated/graphql-schema';

const uploadVisualMock = vi.fn(async () => ({}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateWhiteboardOnCalloutMutation: () => [vi.fn(), { loading: false }],
  useDeleteWhiteboardMutation: () => [vi.fn(), { loading: false }],
  useUpdateWhiteboardMutation: () => [vi.fn(), { loading: false }],
  useUploadVisualMutation: () => [uploadVisualMock, { loading: false }],
  WhiteboardDetailsFragmentDoc: {},
}));

import useWhiteboardActions from './useWhiteboardActions';

describe('useWhiteboardActions', () => {
  it('uploads the preview visuals on update without the global error handler, since the dialog reports a failure itself', async () => {
    const { result } = renderHook(() => useWhiteboardActions());

    await act(async () => {
      await result.current.actions.onUpdate(
        { nameID: 'wb', profile: { visual: { id: 'card-1' }, preview: { id: 'preview-1' } } },
        [
          { visualType: VisualType.Card, imageData: new Blob(['c']) },
          { visualType: VisualType.WhiteboardPreview, imageData: new Blob(['p']) },
        ]
      );
    });

    expect(uploadVisualMock).toHaveBeenCalledTimes(2);
    for (const [options] of uploadVisualMock.mock.calls as unknown as [{ context?: unknown }][]) {
      expect(options.context).toEqual({ skipGlobalErrorHandler: true });
    }
  });
});
