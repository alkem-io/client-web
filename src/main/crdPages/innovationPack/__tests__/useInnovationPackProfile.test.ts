import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

const useInnovationPackProfilePageQueryMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useInnovationPackProfilePageQuery: (opts: unknown) => useInnovationPackProfilePageQueryMock(opts),
}));
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({ innovationPackId: 'pack-1', templateId: undefined, loading: false }),
}));
vi.mock('@/main/crdPages/templates/useTemplatesManager', () => ({
  useTemplatesManager: () => ({ loading: false, onTemplateAction: vi.fn() }),
}));

const { useInnovationPackProfile } = await import('../useInnovationPackProfile');

const arrange = (myPrivileges: AuthorizationPrivilege[]) => {
  useInnovationPackProfilePageQueryMock.mockReturnValue({
    loading: false,
    data: {
      lookup: {
        innovationPack: {
          id: 'pack-1',
          authorization: { myPrivileges },
          templatesSet: { id: 'ts-1' },
          profile: { displayName: 'Pack', url: 'https://alkem.io/innovation-packs/pack' },
          provider: undefined,
        },
      },
    },
  });
  return renderHook(() => useInnovationPackProfile()).result.current;
};

/**
 * "Manage this pack" is the pack's only in-place edit entry. It must open for
 * every viewer the server lets edit the pack — the owner (Update) AND Platform
 * Support (A7's PLATFORM_SUPPORT_ORG_RESOURCES, 027 R-F.2 2026-09-16), which
 * never holds Update on an organization's pack.
 */
describe('useInnovationPackProfile — canManage', () => {
  test('the owner manages through Update', () => {
    const result = arrange([AuthorizationPrivilege.Update]);
    expect(result.canManage).toBe(true);
    expect(result.adminHref).toBe('https://alkem.io/innovation-packs/pack/settings');
  });

  test('Platform Support manages through PlatformSupportOrgResources without Update (A7)', () => {
    const result = arrange([AuthorizationPrivilege.PlatformSupportOrgResources]);
    expect(result.canManage).toBe(true);
    expect(result.adminHref).toBe('https://alkem.io/innovation-packs/pack/settings');
  });

  test('a plain reader gets no manage affordance', () => {
    const result = arrange([AuthorizationPrivilege.Read]);
    expect(result.canManage).toBe(false);
    expect(result.adminHref).toBeUndefined();
  });
});
