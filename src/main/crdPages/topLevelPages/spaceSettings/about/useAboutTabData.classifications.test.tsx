/**
 * @vitest-environment jsdom
 *
 * `useAboutTabData` against a mocked Apollo layer: the unsaved-changes buffer (spec 045 FR-005a /
 * FR-025) — text fields and the staged classification actions of workspace spec 024 Session
 * 2026-10-22. Nothing is written until `unsaved.saveAll()`; `unsaved.reset()` restores the server
 * values; a failed write keeps only that change counted.
 */
import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { FC, PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  AddClassificationEntryFromTemplateDocument,
  DeleteClassificationEntryDocument,
  SpaceAboutDetailsDocument,
  UpdateClassificationEntrySelectionDocument,
  UpdateSpaceDocument,
} from '@/core/apollo/generated/apollo-hooks';
import type {
  AddClassificationEntryFromTemplateMutation,
  SpaceAboutDetailsQuery,
  UpdateClassificationEntrySelectionMutation,
} from '@/core/apollo/generated/graphql-schema';
import i18n from '@/core/i18n/config';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import type { ClassificationTemplateOptionData } from '@/crd/components/classification/types';
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
  classifications: ReturnType<typeof classificationEntry>[],
  profile: Partial<typeof emptyProfile> = {}
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
            profile: { ...emptyProfile, ...profile },
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

const SDGS_TEMPLATE: ClassificationTemplateOptionData = {
  id: 'tpl-sdgs',
  displayLabel: 'SDGs',
  description: '',
  cardinality: 'MULTI_SELECT',
  values: [
    { id: 'v-climate', label: 'Climate Action' },
    { id: 'v-life-below-water', label: 'Life Below Water' },
  ],
};

const deleteEntryMock = (entryId: string): MockedResponse => ({
  request: { query: DeleteClassificationEntryDocument, variables: { classificationData: { ID: entryId } } },
  result: { data: { deleteClassificationEntry: { __typename: 'ClassificationEntry', id: entryId } } },
});

const renderAbout = (mocks: MockedResponse[]) =>
  renderHook(() => useAboutTabData(SPACE_ID, '/space-1', 'L1'), { wrapper: makeWrapper(mocks) });

describe('useAboutTabData — unsaved-changes buffer', () => {
  it('counts each changed text field and drops a field from the count when it is put back', async () => {
    const { result } = renderAbout([spaceAboutDetailsMock([])]);
    await waitFor(() => expect(result.current.values).not.toBeNull());
    expect(result.current.unsaved.count).toBe(0);

    act(() => result.current.onChange({ name: 'Renamed', tagline: 'New tagline' }));
    expect(result.current.unsaved.count).toBe(2);

    act(() => result.current.onChange({ name: 'Test Space' }));
    expect(result.current.unsaved.count).toBe(1);
  });

  it('saves every changed field in one updateSpace and rebases on the refetched values', async () => {
    const updateSpace = vi.fn(() => ({ data: { updateSpace: { __typename: 'Space', id: SPACE_ID } } }));
    const { result } = renderAbout([
      spaceAboutDetailsMock([]),
      {
        request: {
          query: UpdateSpaceDocument,
          variables: {
            input: { ID: SPACE_ID, about: { profile: { displayName: 'Renamed', tagline: 'New tagline' } } },
          },
        },
        result: updateSpace,
      },
      spaceAboutDetailsMock([], { displayName: 'Renamed', tagline: 'New tagline' }),
    ]);
    await waitFor(() => expect(result.current.values).not.toBeNull());

    act(() => result.current.onChange({ name: 'Renamed', tagline: 'New tagline' }));
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(true);
    expect(updateSpace).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.unsaved.count).toBe(0));
    expect(result.current.values?.name).toBe('Renamed');
  });

  it('holds a new reference with a URL but no title as an unsaved, unsavable change instead of dropping it', async () => {
    const { result } = renderAbout([spaceAboutDetailsMock([])]);
    await waitFor(() => expect(result.current.values).not.toBeNull());

    act(() => result.current.onReferencesChange([{ name: '', uri: 'https://example.org', description: '' }]));
    expect(result.current.unsaved.count).toBe(1);
    expect(result.current.unsaved.canSave).toBe(false);
    expect(result.current.untitledReferenceIds).toHaveLength(1);

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });
    expect(ok).toBe(false);
    expect(result.current.values?.references.map(r => r.uri)).toEqual(['https://example.org']);

    // An entirely empty row is just ignored, as before.
    act(() => result.current.onReferencesChange([{ name: '', uri: '', description: '' }]));
    expect(result.current.unsaved.count).toBe(0);
    expect(result.current.unsaved.canSave).toBe(true);
  });

  it('reset puts the changed fields back without a request', async () => {
    const { result } = renderAbout([spaceAboutDetailsMock([])]);
    await waitFor(() => expect(result.current.values).not.toBeNull());

    act(() => result.current.onChange({ name: 'Renamed' }));
    act(() => result.current.unsaved.reset());

    expect(result.current.values?.name).toBe('Test Space');
    expect(result.current.unsaved.count).toBe(0);
  });
});

describe('useAboutTabData — staged classifications (spec 024 Session 2026-10-22)', () => {
  it('stages an add from the template, then writes the add and its selection on Save', async () => {
    const created = classificationEntry('entry-1');
    const { result } = renderAbout([
      spaceAboutDetailsMock([]),
      addClassificationMock('tpl-sdgs', 'SDGs', created),
      updateSelectionMock(
        'entry-1',
        ['v-climate'],
        classificationEntry('entry-1', { selectedValueIDs: ['v-climate'] })
      ),
      spaceAboutDetailsMock([classificationEntry('entry-1', { selectedValueIDs: ['v-climate'] })]),
    ]);
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.addClassificationFromTemplate(SDGS_TEMPLATE);
    });
    const tempId = result.current.unsavedClassificationIds[0];
    expect(result.current.classifications).toHaveLength(1);
    expect(result.current.classifications[0]).toMatchObject({ id: tempId, displayLabel: 'SDGs' });

    act(() => result.current.updateClassificationSelection(tempId, ['v-climate']));
    // The add and its values are one staged classification.
    expect(result.current.unsaved.count).toBe(1);

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(true);
    await waitFor(() =>
      expect(result.current.classifications).toEqual([
        expect.objectContaining({ id: 'entry-1', selectedValueIDs: ['v-climate'] }),
      ])
    );
    expect(result.current.unsavedClassificationIds).toEqual([]);
    expect(result.current.unsaved.count).toBe(0);
  });

  it('reports the Save as failed when the refresh after the writes fails, so the page offers a reload', async () => {
    const { result } = renderAbout([
      spaceAboutDetailsMock([]),
      addClassificationMock('tpl-sdgs', 'SDGs', classificationEntry('entry-1')),
      {
        request: { query: SpaceAboutDetailsDocument, variables: { spaceId: SPACE_ID } },
        error: new Error('Network down'),
      },
    ]);
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.addClassificationFromTemplate(SDGS_TEMPLATE);
    });

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(false);
    expect(result.current.unsaved.error).toBe('Network down');
  });

  it('rejects a pick whose label collides with an existing classification after FR-011c normalisation', async () => {
    const { result } = renderAbout([spaceAboutDetailsMock([classificationEntry('entry-1', { displayLabel: 'SDGs' })])]);
    await waitFor(() => expect(result.current.classifications).toHaveLength(1));

    let ok: boolean | undefined;
    act(() => {
      ok = result.current.addClassificationFromTemplate(SDGS_TEMPLATE, '  sdgs ');
    });

    expect(ok).toBe(false);
    expect(result.current.classificationConflict).toEqual({ templateId: 'tpl-sdgs', attemptedLabel: '  sdgs ' });
    expect(result.current.unsaved.count).toBe(0);
  });

  it('stages a removal without a request and Discard brings the classification back', async () => {
    const { result } = renderAbout([spaceAboutDetailsMock([classificationEntry('entry-1')])]);
    await waitFor(() => expect(result.current.classifications).toHaveLength(1));

    act(() => result.current.removeClassification('entry-1'));
    expect(result.current.classifications).toHaveLength(0);
    expect(result.current.unsaved.count).toBe(1);

    act(() => result.current.unsaved.reset());
    expect(result.current.classifications).toHaveLength(1);
    expect(result.current.unsaved.count).toBe(0);
  });

  it('a classification added and removed before Save simply disappears', async () => {
    const { result } = renderAbout([spaceAboutDetailsMock([])]);
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.addClassificationFromTemplate(SDGS_TEMPLATE);
    });
    act(() => result.current.removeClassification(result.current.unsavedClassificationIds[0]));

    expect(result.current.classifications).toHaveLength(0);
    expect(result.current.unsaved.count).toBe(0);
  });

  it('keeps only the failed change counted when part of the Save fails', async () => {
    const { result } = renderAbout([
      spaceAboutDetailsMock([
        classificationEntry('entry-1'),
        classificationEntry('entry-2', { displayLabel: 'Sector' }),
      ]),
      deleteEntryMock('entry-2'),
      updateSelectionMock('entry-1', ['v-climate'], classificationEntry('entry-1'), {
        error: new Error('Selection rejected'),
      }),
      spaceAboutDetailsMock([classificationEntry('entry-1')]),
    ]);
    await waitFor(() => expect(result.current.classifications).toHaveLength(2));

    act(() => result.current.removeClassification('entry-2'));
    act(() => result.current.updateClassificationSelection('entry-1', ['v-climate']));
    expect(result.current.unsaved.count).toBe(2);

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(false);
    expect(result.current.unsaved.error).toMatch(/Selection rejected/);
    await waitFor(() => expect(result.current.unsaved.count).toBe(1));
    expect(result.current.classifications).toEqual([
      expect.objectContaining({ id: 'entry-1', selectedValueIDs: ['v-climate'] }),
    ]);
  });
  it('stops counting a removal that failed because someone else already deleted the classification', async () => {
    const { result } = renderAbout([
      spaceAboutDetailsMock([classificationEntry('entry-1')]),
      {
        request: { query: DeleteClassificationEntryDocument, variables: { classificationData: { ID: 'entry-1' } } },
        error: new Error('Classification entry not found'),
      },
      // The refetch after Save: the other admin's delete has landed.
      spaceAboutDetailsMock([]),
    ]);
    await waitFor(() => expect(result.current.classifications).toHaveLength(1));

    act(() => result.current.removeClassification('entry-1'));
    expect(result.current.unsaved.count).toBe(1);

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(false);
    expect(result.current.unsaved.error).toMatch(/not found/);
    await waitFor(() => expect(result.current.unsaved.count).toBe(0));
    expect(result.current.classifications).toEqual([]);
  });
});
