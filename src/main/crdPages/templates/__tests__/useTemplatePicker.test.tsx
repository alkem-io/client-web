/**
 * @vitest-environment jsdom
 *
 * T024 — `useTemplatePicker` (`mode: 'select'`) Apollo wiring tests.
 *
 * The hook drives the **consumption** picker used by every "use a template" flow (callout / whiteboard /
 * subspace / community-guidelines / post-default). It runs up to three source queries (Space / Account /
 * Platform) filtered to `allowedTypes` and feeds the result into the `TemplatePicker` view as
 * `pickerProps.sources`.
 *
 * Pattern after `useGuestSession.spec.tsx`: `renderHook` + `MockedProvider` wrapper (precedent in
 * `src/domain/collaboration/whiteboard/guestAccess/tests/`).
 */
import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { FC, PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import {
  ImportTemplateDialogAccountTemplatesDocument,
  ImportTemplateDialogDocument,
  ImportTemplateDialogPlatformTemplatesDocument,
} from '@/core/apollo/generated/apollo-hooks';
import {
  TemplateType as GqlTemplateType,
  type ImportTemplateDialogAccountTemplatesQuery,
  type ImportTemplateDialogPlatformTemplatesQuery,
  type ImportTemplateDialogQuery,
} from '@/core/apollo/generated/graphql-schema';
import { useTemplatePicker } from '../useTemplatePicker';

// ---------------------------------------------------------------------------
// Fixture builders — every template carries a TemplateProfileInfo-compatible shape.
// We deliberately cast the response data through `unknown` so the test fixture
// doesn't have to mirror every fragment field; the mapper only reads what it needs.
// ---------------------------------------------------------------------------

const tpl = (id: string, type: GqlTemplateType, name: string) => ({
  __typename: 'Template',
  id,
  type,
  profile: {
    __typename: 'Profile',
    id: `${id}-profile`,
    displayName: name,
    description: `${name} description`,
    defaultTagset: { __typename: 'Tagset', id: `${id}-tagset`, tags: [] },
    visual: { __typename: 'Visual', id: `${id}-visual`, uri: '' },
    url: `/template/${id}`,
  },
});

const importDialogMock = (
  templatesSetId: string,
  templates: ReturnType<typeof tpl>[]
): MockedResponse<ImportTemplateDialogQuery> => ({
  request: {
    query: ImportTemplateDialogDocument,
    variables: { templatesSetId, includeCallout: true, includeSpace: false },
  },
  result: {
    data: {
      lookup: {
        __typename: 'LookupQueryResults',
        templatesSet: {
          __typename: 'TemplatesSet',
          id: templatesSetId,
          templates,
        },
      },
    } as unknown as ImportTemplateDialogQuery,
  },
});

const accountMock = (
  accountId: string,
  packs: Array<{ id: string; displayName: string; templates: ReturnType<typeof tpl>[] }>
): MockedResponse<ImportTemplateDialogAccountTemplatesQuery> => ({
  request: {
    query: ImportTemplateDialogAccountTemplatesDocument,
    variables: { accountId, includeCallout: true, includeSpace: false },
  },
  result: {
    data: {
      lookup: {
        __typename: 'LookupQueryResults',
        account: {
          __typename: 'Account',
          id: accountId,
          innovationPacks: packs.map(p => ({
            __typename: 'InnovationPack',
            id: p.id,
            profile: { __typename: 'Profile', id: `${p.id}-profile`, displayName: p.displayName, url: `/pack/${p.id}` },
            provider: null,
            templatesSet: { __typename: 'TemplatesSet', id: `${p.id}-set`, templates: p.templates },
          })),
        },
      },
    } as unknown as ImportTemplateDialogAccountTemplatesQuery,
  },
});

const platformMock = (
  allowedTypes: GqlTemplateType[],
  results: Array<{ template: ReturnType<typeof tpl>; packDisplayName: string; packProviderDisplayName?: string }>
): MockedResponse<ImportTemplateDialogPlatformTemplatesQuery> => ({
  request: {
    query: ImportTemplateDialogPlatformTemplatesDocument,
    variables: { templateTypes: allowedTypes, includeCallout: true, includeSpace: false },
  },
  result: {
    data: {
      platform: {
        __typename: 'Platform',
        library: {
          __typename: 'Library',
          // The hook reads `result.innovationPack.provider.profile?.displayName` — `provider` itself is
          // always present in the live schema, only the `profile` field on it is nullable. Reflect that here.
          templates: results.map(({ template, packDisplayName, packProviderDisplayName }) => ({
            __typename: 'LibraryTemplateResult',
            template,
            innovationPack: {
              __typename: 'InnovationPack',
              id: `${template.id}-libpack`,
              profile: { __typename: 'Profile', id: `${template.id}-libpack-profile`, displayName: packDisplayName },
              provider: {
                __typename: 'Organization',
                profile: packProviderDisplayName
                  ? { __typename: 'Profile', id: 'org', displayName: packProviderDisplayName }
                  : null,
              },
            },
          })),
        },
      },
    } as unknown as ImportTemplateDialogPlatformTemplatesQuery,
  },
});

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

const makeWrapper = (mocks: MockedResponse[]): FC<PropsWithChildren> => {
  return ({ children }) => (
    <MockedProvider mocks={mocks} cache={new InMemoryCache()}>
      {children}
    </MockedProvider>
  );
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useTemplatePicker — basics', () => {
  it('starts closed and exposes no selection / no content until openPicker() is called', () => {
    const wrapper = makeWrapper([]);
    const { result } = renderHook(() => useTemplatePicker({ allowedTypes: ['callout'] }), { wrapper });
    expect(result.current.pickerProps.open).toBe(false);
    expect(result.current.selectedTemplateId).toBeNull();
    expect(result.current.selectedTemplateContent).toBeNull();
  });

  it('opens the picker on openPicker() and reports it through pickerProps.open', () => {
    const wrapper = makeWrapper([platformMock([GqlTemplateType.Callout], [])]);
    const { result } = renderHook(() => useTemplatePicker({ allowedTypes: ['callout'] }), { wrapper });

    act(() => {
      result.current.openPicker();
    });

    expect(result.current.pickerProps.open).toBe(true);
  });
});

describe('useTemplatePicker — source loading + allowedTypes filtering', () => {
  it('loads Space + Account + Platform sources once the picker is open', async () => {
    const spaceCallout = tpl('sc-1', GqlTemplateType.Callout, 'Space callout');
    const accountCallout = tpl('ac-1', GqlTemplateType.Callout, 'Account callout');
    const platformCallout = tpl('pc-1', GqlTemplateType.Callout, 'Platform callout');

    const wrapper = makeWrapper([
      importDialogMock('set-1', [spaceCallout]),
      accountMock('account-1', [{ id: 'pack-1', displayName: 'My Pack', templates: [accountCallout] }]),
      platformMock([GqlTemplateType.Callout], [{ template: platformCallout, packDisplayName: 'Lib Pack' }]),
    ]);

    const { result } = renderHook(
      () =>
        useTemplatePicker({
          allowedTypes: ['callout'],
          spaceTemplatesSetId: 'set-1',
          accountId: 'account-1',
        }),
      { wrapper }
    );

    act(() => {
      result.current.openPicker();
    });

    await waitFor(() => {
      const sources = result.current.pickerProps.sources;
      expect(sources.find(s => s.key === 'space')?.loading).toBe(false);
      expect(sources.find(s => s.key === 'account')?.loading).toBe(false);
      expect(sources.find(s => s.key === 'platform')?.loading).toBe(false);
    });

    const sources = result.current.pickerProps.sources;
    expect(sources.find(s => s.key === 'space')?.templates.map(t => t.id)).toEqual(['sc-1']);
    expect(sources.find(s => s.key === 'account')?.templates.map(t => t.id)).toEqual(['ac-1']);
    expect(sources.find(s => s.key === 'platform')?.templates.map(t => t.id)).toEqual(['pc-1']);
  });

  it('omits the Space source when no spaceTemplatesSetId is supplied (consumption outside a space context)', async () => {
    const wrapper = makeWrapper([accountMock('account-1', []), platformMock([GqlTemplateType.Whiteboard], [])]);

    const { result } = renderHook(
      () =>
        useTemplatePicker({
          allowedTypes: ['whiteboard'],
          accountId: 'account-1',
        }),
      { wrapper }
    );

    act(() => {
      result.current.openPicker();
    });

    await waitFor(() => {
      const sources = result.current.pickerProps.sources;
      expect(sources.find(s => s.key === 'platform')?.loading).toBe(false);
    });

    const sources = result.current.pickerProps.sources;
    expect(sources.map(s => s.key)).toEqual(['account', 'platform']);
  });

  it('filters each source to allowedTypes — a Space template in a callout picker is dropped', async () => {
    const callout = tpl('c1', GqlTemplateType.Callout, 'A callout');
    const spaceTpl = tpl('s1', GqlTemplateType.Space, 'A space');

    const wrapper = makeWrapper([
      importDialogMock('set-1', [callout, spaceTpl]),
      accountMock('account-1', []),
      platformMock([GqlTemplateType.Callout], []),
    ]);

    const { result } = renderHook(
      () =>
        useTemplatePicker({
          allowedTypes: ['callout'],
          spaceTemplatesSetId: 'set-1',
          accountId: 'account-1',
        }),
      { wrapper }
    );

    act(() => {
      result.current.openPicker();
    });

    await waitFor(() => {
      expect(result.current.pickerProps.sources.find(s => s.key === 'space')?.loading).toBe(false);
    });

    const spaceSource = result.current.pickerProps.sources.find(s => s.key === 'space');
    expect(spaceSource?.templates.map(t => t.id)).toEqual(['c1']);
  });

  it('tags account-source templates with the owning pack displayName as ownerLabel', async () => {
    const acTpl = tpl('ac-1', GqlTemplateType.Callout, 'Pack callout');

    const wrapper = makeWrapper([
      accountMock('account-1', [{ id: 'pack-9', displayName: 'My Account Pack', templates: [acTpl] }]),
      platformMock([GqlTemplateType.Callout], []),
    ]);

    const { result } = renderHook(() => useTemplatePicker({ allowedTypes: ['callout'], accountId: 'account-1' }), {
      wrapper,
    });

    act(() => {
      result.current.openPicker();
    });

    await waitFor(() => {
      expect(result.current.pickerProps.sources.find(s => s.key === 'account')?.loading).toBe(false);
    });

    const accountSource = result.current.pickerProps.sources.find(s => s.key === 'account');
    expect(accountSource?.templates[0].ownerLabel).toBe('My Account Pack');
  });
});

describe('useTemplatePicker — selection lifecycle', () => {
  it('clearSelection() resets the transient selection back to null', async () => {
    const wrapper = makeWrapper([platformMock([GqlTemplateType.Whiteboard], [])]);
    const { result } = renderHook(() => useTemplatePicker({ allowedTypes: ['whiteboard'] }), { wrapper });

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedTemplateId).toBeNull();
    expect(result.current.selectedTemplateContent).toBeNull();
  });
});
