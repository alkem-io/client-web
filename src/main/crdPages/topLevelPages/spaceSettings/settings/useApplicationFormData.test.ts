import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { updateForm } = vi.hoisted(() => ({ updateForm: vi.fn((_options: unknown) => Promise.resolve({})) }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchRoleSetApplicationFormQuery: () => ({}),
  useRoleSetApplicationFormQuery: () => ({ data: undefined, loading: false }),
  useUpdateApplicationFormOnRoleSetMutation: () => [updateForm, { loading: false }],
}));

import { useApplicationFormData } from './useApplicationFormData';

describe('useApplicationFormData', () => {
  it('passes the caller context to the save, so a caller that shows its own failure skips the global error handler', async () => {
    const { result } = renderHook(() => useApplicationFormData('role-set-1'));
    act(() => result.current.onDescriptionChange('Tell us about yourself'));

    await act(async () => {
      await result.current.onSave({ skipGlobalErrorHandler: true });
    });

    expect(updateForm).toHaveBeenCalledWith(expect.objectContaining({ context: { skipGlobalErrorHandler: true } }));
  });
});
