/**
 * @vitest-environment jsdom
 *
 * Classifications integration coverage for `useAboutTabData` (024-classifications). The rest of
 * the hook (branding uploads, per-section About save) is covered elsewhere; this file exercises
 * the classification handlers against a mocked Apollo layer — the layer that shipped with zero
 * tests (qual-cw-2) and hid both a display-label-conflict labelling bug (corr-client-1) and a
 * multi-select selection race (corr-client-3 / spec-client-1).
 */
import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { FC, PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  AddClassificationEntryFromTemplateDocument,
  SpaceAboutDetailsDocument,
  UpdateClassificationEntrySelectionDocument,
} from '@/core/apollo/generated/apollo-hooks';
import type {
  AddClassificationEntryFromTemplateMutation,
  SpaceAboutDetailsQuery,
  UpdateClassificationEntrySelectionMutation,
} from '@/core/apollo/generated/graphql-schema';
import i18n from '@/core/i18n/config';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import { useAboutTabData } from './useAboutTabData';

// `useStorageConfigContext` throws outside a `StorageConfigContextProvider`, and standing one up
// would drag in a whole second Apollo query unrelated to classifications — the reference-upload
// path this hook also wires. `useReferenceFileUpload` already tolerates `undefined` (edit flows
// with no bucket resolved yet), so stub the context read instead of wiring the real provider.
vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({
  useStorageConfigContext: () => undefined,
}));

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-spaceSettings');
});

const SPACE_ID = 'space-1';

// Apollo's cache write requires every selected nullable field to be explicitly `null` —
// an omitted (or `undefined`) key reads as "missing", which makes the cache treat the
// query result as incomplete and silently re-issues a network request for it, consuming
// mocks a test never expected to need.
const emptyProfile = {
  __typename: 'Profile',
  id: 'profile-1',
  url: '/space-1',
  displayName: 'Test Space',
  tagline: '',
  description: '',
  tagset: null,
  avatar: null,
  banner: null,
  cardBanner: null,
  references: [],
  location: null,
};

const classificationEntry = (
  id: string,
  overrides: Partial<{
    displayLabel: string;
    selectedValueIDs: string[];
    values: Array<{ id: string; label: string }>;
    display: boolean;
    sortOrder: number;
  }> = {}
) => ({
  __typename: 'ClassificationEntry' as const,
  id,
  displayLabel: overrides.displayLabel ?? 'SDGs',
  cardinality: 'MULTI_SELECT',
  display: overrides.display ?? true,
  sortOrder: overrides.sortOrder ?? 0,
  values: (
    overrides.values ?? [
      { id: 'v-climate', label: 'Climate Action' },
      { id: 'v-life-below-water', label: 'Life Below Water' },
    ]
  ).map(v => ({ __typename: 'ClassificationValue' as const, ...v })),
  selectedValueIDs: overrides.selectedValueIDs ?? [],
});

/**
 * Builds a `SpaceAboutDetails` mock. `mapSpaceToAboutFormValues` / `mapClassificationEntries`
 * only read a handful of these fields, but the full selection set is populated anyway (with
 * `null`/empty-array stand-ins) — an incomplete cache write is exactly what breaks the "no
 * refetch on a successful selection write" assertions below.
 */
const spaceAboutDetailsMock = (
  classifications: ReturnType<typeof classificationEntry>[]
): MockedResponse<SpaceAboutDetailsQuery> => ({
  request: { query: SpaceAboutDetailsDocument, variables: { spaceId: SPACE_ID } },
  result: {
    data: {
      lookup: {
        __typename: 'LookupQueryResults',
        space: {
          __typename: 'Space',
          id: SPACE_ID,
          nameID: 'test-space',
          level: 'L1',
          visibility: 'ACTIVE',
          authorization: { __typename: 'Authorization', id: 'auth-1', myPrivileges: [] },
          about: {
            __typename: 'SpaceAbout',
            id: 'about-1',
            who: '',
            why: '',
            isContentPublic: true,
            authorization: { __typename: 'Authorization', id: 'auth-about-1', myPrivileges: [] },
            membership: {
              __typename: 'SpaceAboutMembership',
              roleSetID: 'role-set-1',
              communityID: 'community-1',
              myMembershipStatus: null,
              leadOrganizations: [],
              leadUsers: [],
            },
            provider: null,
            profile: emptyProfile,
            guidelines: { __typename: 'CommunityGuidelines', id: 'guidelines-1' },
            metrics: [],
            classifications,
          },
        },
      },
    } as unknown as SpaceAboutDetailsQuery,
  },
});

const addClassificationMock = (
  templateId: string,
  displayLabel: string | undefined,
  entry: ReturnType<typeof classificationEntry>
): MockedResponse<AddClassificationEntryFromTemplateMutation> => ({
  request: {
    query: AddClassificationEntryFromTemplateDocument,
    variables: { classificationData: { spaceID: SPACE_ID, templateID: templateId, displayLabel } },
  },
  result: {
    data: { addClassificationEntryFromTemplate: entry } as unknown as AddClassificationEntryFromTemplateMutation,
  },
});

const updateSelectionMock = (
  entryId: string,
  selectedValueIDs: string[],
  responseEntry: ReturnType<typeof classificationEntry>,
  { error }: { error?: Error } = {}
): MockedResponse<UpdateClassificationEntrySelectionMutation> => ({
  request: {
    query: UpdateClassificationEntrySelectionDocument,
    variables: { classificationData: { classificationEntryID: entryId, selectedValueIDs } },
  },
  ...(error
    ? { error }
    : {
        result: {
          data: {
            updateClassificationEntrySelection: responseEntry,
          } as unknown as UpdateClassificationEntrySelectionMutation,
        },
      }),
});

const makeWrapper = (mocks: MockedResponse[]): FC<PropsWithChildren> => {
  return ({ children }) => (
    <MockedProvider mocks={mocks} cache={new InMemoryCache()}>
      <GlobalStateProvider>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </GlobalStateProvider>
    </MockedProvider>
  );
};

describe('useAboutTabData — classifications (US1)', () => {
  it('adding a template persists with zero selected values and refetches (FR-012a, US1-AS2)', async () => {
    const added = classificationEntry('entry-1', { selectedValueIDs: [] });
    const wrapper = makeWrapper([
      spaceAboutDetailsMock([]),
      addClassificationMock('tpl-sdgs', 'SDGs', added),
      // The add path refetches SpaceAboutDetails to pick up the new entry.
      spaceAboutDetailsMock([added]),
    ]);
    const { result } = renderHook(() => useAboutTabData(SPACE_ID, '/space-1', 'L1'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.classifications).toHaveLength(0);

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.addClassificationFromTemplate('tpl-sdgs', 'SDGs');
    });

    expect(ok).toBe(true);
    await waitFor(() => expect(result.current.classifications).toHaveLength(1));
    expect(result.current.classifications[0]).toMatchObject({ id: 'entry-1', selectedValueIDs: [] });
  });

  it('a selection write against a concurrently-removed entry refetches instead of re-creating it (FR-014b, S-15)', async () => {
    const wrapper = makeWrapper([
      spaceAboutDetailsMock([]),
      updateSelectionMock('gone', ['v-climate'], classificationEntry('gone'), {
        error: new Error('Classification entry not found'),
      }),
      // The catch refetches — the entry is gone server-side, so the list comes back empty.
      spaceAboutDetailsMock([]),
    ]);
    const { result } = renderHook(() => useAboutTabData(SPACE_ID, '/space-1', 'L1'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.classificationRemovedError).toBe(false);

    await act(async () => {
      await result.current.updateClassificationSelection('gone', ['v-climate']);
    });

    expect(result.current.classificationRemovedError).toBe(true);
    expect(result.current.classifications).toHaveLength(0);
  });

  it('composes a second rapid selection write off the first locally-applied one, not the stale cache (corr-client-3 / spec-client-1)', async () => {
    const initial = classificationEntry('entry-1', { selectedValueIDs: [] });
    // The server round trip for the FIRST write only ever reports `['v-climate']` back — if the
    // second write were built from that stale response instead of the locally-applied selection,
    // the assertion on the second mutation's variables below would fail.
    const afterFirst = classificationEntry('entry-1', { selectedValueIDs: ['v-climate'] });
    const afterSecond = classificationEntry('entry-1', { selectedValueIDs: ['v-climate', 'v-life-below-water'] });
    const wrapper = makeWrapper([
      spaceAboutDetailsMock([initial]),
      updateSelectionMock('entry-1', ['v-climate'], afterFirst),
      updateSelectionMock('entry-1', ['v-climate', 'v-life-below-water'], afterSecond),
    ]);
    const { result } = renderHook(() => useAboutTabData(SPACE_ID, '/space-1', 'L1'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Fire both writes back-to-back, before either mutation round trip resolves — this is the
    // window in which the reported bug silently dropped the first click's selection.
    let firstWrite!: Promise<void>;
    act(() => {
      firstWrite = result.current.updateClassificationSelection('entry-1', ['v-climate']);
    });
    // The entry the View reads for its NEXT toggle must already reflect the first click locally.
    expect(result.current.classifications[0].selectedValueIDs).toEqual(['v-climate']);
    expect(result.current.classificationSelectionPendingIds).toContain('entry-1');

    let secondWrite!: Promise<void>;
    act(() => {
      secondWrite = result.current.updateClassificationSelection('entry-1', ['v-climate', 'v-life-below-water']);
    });

    await act(async () => {
      await Promise.all([firstWrite, secondWrite]);
    });

    expect(result.current.classifications[0].selectedValueIDs).toEqual(['v-climate', 'v-life-below-water']);
    expect(result.current.classificationSelectionPendingIds).toEqual([]);
  });
});
