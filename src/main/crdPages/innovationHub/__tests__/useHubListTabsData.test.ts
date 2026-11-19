import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { hookOptions } = vi.hoisted(() => ({ hookOptions: [] as unknown[] }));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateInnovationHubMutation: (options: unknown) => {
    hookOptions.push(options);
    return [vi.fn(), { loading: false }];
  },
}));

import { useHubPacksTabData } from '../hooks/useHubPacksTabData';
import { useHubSpacesTabData } from '../hooks/useHubSpacesTabData';
import { useHubVirtualContributorsTabData } from '../hooks/useHubVirtualContributorsTabData';

describe('Innovation Hub Spaces / Virtual Contributors / Packs tabs', () => {
  it.each([
    ['Spaces', useHubSpacesTabData],
    ['Virtual Contributors', useHubVirtualContributorsTabData],
    ['Packs', useHubPacksTabData],
  ])('the %s tab toasts its own failure, so its update opts out of the global error handler', (_tab, useTabData) => {
    hookOptions.length = 0;
    renderHook(() => useTabData(undefined, () => Promise.resolve()));
    expect(hookOptions[hookOptions.length - 1]).toEqual({ context: { skipGlobalErrorHandler: true } });
  });
});
