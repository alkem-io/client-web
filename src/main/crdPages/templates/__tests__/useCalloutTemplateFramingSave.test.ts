import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { UseCrdCalloutFormResult } from '@/main/crdPages/space/hooks/useCrdCalloutForm';

const pollOptionManagementParams = vi.fn();

vi.mock('@/domain/collaboration/poll/hooks/usePollOptionManagement', () => ({
  usePollOptionManagement: (params: unknown) => {
    pollOptionManagementParams(params);
    return {};
  },
}));
vi.mock('@/main/crdPages/space/callout/useCalloutFormDefinitionSave', () => ({
  useCalloutFormDefinitionSave: () => ({ save: vi.fn() }),
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));

import { useCalloutTemplateFramingSave } from '../useCalloutTemplateFramingSave';

describe('useCalloutTemplateFramingSave', () => {
  it("leaves a refused poll option save to the global error handler, which shows the server's reason", () => {
    const form = { values: { editMeta: { pollId: 'poll-1' } } } as unknown as UseCrdCalloutFormResult;
    renderHook(() => useCalloutTemplateFramingSave(form));

    expect(pollOptionManagementParams).toHaveBeenCalledWith({ pollId: 'poll-1' });
  });
});
