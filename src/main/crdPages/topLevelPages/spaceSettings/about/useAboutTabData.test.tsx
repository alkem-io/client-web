/**
 * @vitest-environment jsdom
 *
 * `useAboutTabData` against the native API: the unsaved-changes buffer (spec 045 FR-005a / FR-025) — text, purpose,
 * tags, links and the staged classification actions of workspace spec 024 Session 2026-10-22. Nothing is written
 * until `unsaved.saveAll()`; `unsaved.reset()` restores the server values; a failed write keeps only that change
 * counted.
 */
import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError, print } from 'graphql';
import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { SpaceSettingsAboutQuery } from '@/core/apollo/generated-v2/graphql-schema';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import i18n from '@/core/i18n/config';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import type { ClassificationTemplateOptionData } from '@/crd/components/classification/types';
import { useAboutTabData } from './useAboutTabData';

// The reference paperclip still reads the ambient storage bucket context; stub it, as before.
vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({
  useStorageConfigContext: () => undefined,
}));

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-spaceSettings');
});

const SPACE_ID = 'space-1';

type Classification = NonNullable<
  Extract<SpaceSettingsAboutQuery['node'], { __typename?: 'Space' }>['classifications']
>[number];

const classification = (
  id: string,
  overrides: Partial<{ label: string; selected: string[]; visible: boolean; values: Array<[string, string]> }> = {}
): Classification => ({
  __typename: 'Classification',
  id,
  label: overrides.label ?? 'SDGs',
  settings: { selection: 'many', order: 0, ...(overrides.visible === false ? { visible: false } : {}) },
  values: (
    overrides.values ?? [
      [`${id}-climate`, 'Climate Action'],
      [`${id}-water`, 'Life Below Water'],
    ]
  ).map(([valueId, value], index) => ({ __typename: 'Choice' as const, id: valueId, value, sortOrder: index })),
  selected: (overrides.selected ?? []).map(valueId => ({ __typename: 'Choice' as const, id: valueId })),
});

const about = (
  classifications: Classification[],
  overrides: Partial<{ displayName: string; tagline: string; why: string; links: Array<[string, string, string]> }> = {}
): SpaceSettingsAboutQuery => ({
  node: {
    __typename: 'Space',
    id: SPACE_ID,
    entityType: 'space',
    tags: ['green'],
    about: {
      __typename: 'About',
      displayName: overrides.displayName ?? 'Test Space',
      tagline: overrides.tagline ?? '',
      description: '',
      location: { country: 'NL', city: 'Utrecht' },
      facets: [
        {
          __typename: 'AboutFacet',
          namespace: 'core',
          name: 'purpose',
          value: { why: overrides.why ?? 'Why', who: 'Who' },
        },
      ],
      avatar: null,
      banner: {
        __typename: 'FileRef',
        alt: 'Banner',
        aspectRatio: 6,
        file: { __typename: 'File', id: 'file-banner', url: '/api/files/file-banner' },
      },
      card: null,
    },
    links: (overrides.links ?? [['link-1', 'reference', 'Docs']]).map(([id, role, title], index) => ({
      __typename: 'Link' as const,
      id,
      role,
      uri: `https://example.org/${id}`,
      title,
      description: null,
      sortOrder: index,
    })),
    classifications,
  },
  config: {
    __typename: 'Config',
    visualConstraints: [
      {
        __typename: 'VisualConstraint',
        name: 'banner',
        minWidth: 1200,
        maxWidth: 2400,
        minHeight: 120,
        maxHeight: 400,
        aspectRatio: 6,
        minAspectRatio: 3,
        maxAspectRatio: 10,
      },
    ],
  },
});

type Request = { operationName: string; variables: Record<string, unknown>; query: string };
type Reply = Record<string, unknown> | { errors: GraphQLError[] } | Error;

function renderAbout(handlers: Record<string, Reply[]>, level: 'L0' | 'L1' = 'L1') {
  const requests: Request[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          requests.push({
            operationName: operation.operationName,
            variables: operation.variables,
            query: print(operation.query),
          });
          const reply = handlers[operation.operationName]?.shift();
          const timer = setTimeout(() => {
            if (!reply) observer.error(new Error(`Unexpected ${operation.operationName}`));
            else if (reply instanceof Error) observer.error(reply);
            else if ('errors' in reply) {
              observer.next(reply as { errors: GraphQLError[] });
              observer.complete();
            } else {
              observer.next({ data: reply });
              observer.complete();
            }
          }, 0);
          return () => clearTimeout(timer);
        })
    ),
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <ApolloProvider client={client}>
      <GlobalStateProvider>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </GlobalStateProvider>
    </ApolloProvider>
  );
  const hook = renderHook(() => useAboutTabData(SPACE_ID, '/space-1', level), { wrapper });
  const named = (name: string) => requests.filter(request => request.operationName === name);
  return { ...hook, requests, named };
}

const SDGS_TEMPLATE: ClassificationTemplateOptionData = {
  id: 'tpl-sdgs',
  displayLabel: 'Goals',
  description: '',
  cardinality: 'MULTI_SELECT',
  values: [
    { id: 'tpl-climate', label: 'Climate Action' },
    { id: 'tpl-water', label: 'Life Below Water' },
  ],
};

const spaceResult = { __typename: 'Space', id: SPACE_ID };

describe('useAboutTabData — native read', () => {
  it('maps the one native space read onto the form, the purpose facet and the slot limits included', async () => {
    const fixture = renderAbout(
      { SpaceSettingsAbout: [about([classification('entry-1', { selected: ['entry-1-water'], visible: false })])] },
      'L0'
    );
    await waitFor(() => expect(fixture.result.current.values).not.toBeNull());
    expect(fixture.named('SpaceSettingsAbout')[0].variables).toEqual({ id: SPACE_ID });
    expect(fixture.named('SpaceSettingsAbout')[0].query).not.toMatch(/lookup|profile|tagset/);
    expect(fixture.result.current.values).toMatchObject({
      name: 'Test Space',
      country: 'NL',
      city: 'Utrecht',
      why: 'Why',
      who: 'Who',
      tags: ['green'],
      pageBanner: { id: 'file-banner', uri: '/api/files/file-banner', altText: 'Banner', aspectRatio: 6 },
      references: [{ id: 'link-1', title: 'Docs', uri: 'https://example.org/link-1', description: '' }],
    });
    expect(fixture.result.current.pageBannerAspectRatioBounds).toEqual({ min: 3, max: 10 });
    expect(fixture.result.current.classifications).toEqual([
      expect.objectContaining({
        id: 'entry-1',
        displayLabel: 'SDGs',
        cardinality: 'MULTI_SELECT',
        selectedValueIDs: ['entry-1-water'],
        display: false,
      }),
    ]);
  });
});

describe('useAboutTabData — unsaved-changes buffer', () => {
  it('counts each changed text field and drops a field from the count when it is put back', async () => {
    const { result } = renderAbout({ SpaceSettingsAbout: [about([])] });
    await waitFor(() => expect(result.current.values).not.toBeNull());
    expect(result.current.unsaved.count).toBe(0);

    act(() => result.current.onChange({ name: 'Renamed', tagline: 'New tagline' }));
    expect(result.current.unsaved.count).toBe(2);

    act(() => result.current.onChange({ name: 'Test Space' }));
    expect(result.current.unsaved.count).toBe(1);
  });

  it('saves the text, purpose and tags in one updateSpace and rebases on the refetched values', async () => {
    const fixture = renderAbout({
      SpaceSettingsAbout: [about([]), about([], { displayName: 'Renamed', why: 'New why' })],
      SpaceSettingsUpdateAbout: [{ updateSpace: spaceResult }],
    });
    const { result } = fixture;
    await waitFor(() => expect(result.current.values).not.toBeNull());

    act(() => result.current.onChange({ name: 'Renamed', why: 'New why', tags: ['green', 'blue'] }));
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(true);
    expect(fixture.named('SpaceSettingsUpdateAbout').map(r => r.variables)).toEqual([
      {
        id: SPACE_ID,
        about: {
          displayName: 'Renamed',
          facets: [{ namespace: 'core', name: 'purpose', value: { why: 'New why', who: 'Who' } }],
        },
        tags: ['green', 'blue'],
      },
    ]);
    await waitFor(() => expect(result.current.values?.name).toBe('Renamed'));
  });

  it('writes created, edited and removed references as links, an edited link keeping its role', async () => {
    const fixture = renderAbout({
      SpaceSettingsAbout: [
        about([], {
          links: [
            ['link-1', 'github', 'Code'],
            ['link-2', 'reference', 'Old'],
          ],
        }),
        about([], {
          links: [
            ['link-1', 'github', 'Repo'],
            ['link-3', 'reference', 'New'],
          ],
        }),
      ],
      SpaceSettingsUpsertLink: [
        { upsertLink: { __typename: 'Space', id: SPACE_ID, entityType: 'space' } },
        { upsertLink: { __typename: 'Space', id: SPACE_ID, entityType: 'space' } },
      ],
      SpaceSettingsDeleteLink: [{ deleteLink: { __typename: 'Space', id: SPACE_ID, entityType: 'space' } }],
    });
    const { result } = fixture;
    await waitFor(() => expect(result.current.values?.references).toHaveLength(2));

    act(() =>
      result.current.onReferencesChange([
        { id: 'link-1', name: 'Repo', uri: 'https://example.org/link-1', description: '' },
        { name: 'New', uri: 'https://example.org/new', description: 'd' },
      ])
    );
    expect(result.current.unsaved.count).toBe(3);
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(true);
    expect(fixture.named('SpaceSettingsUpsertLink').map(r => r.variables)).toEqual([
      { owner: SPACE_ID, role: 'reference', uri: 'https://example.org/new', title: 'New', description: 'd' },
      {
        owner: SPACE_ID,
        id: 'link-1',
        role: 'github',
        uri: 'https://example.org/link-1',
        title: 'Repo',
        description: '',
      },
    ]);
    expect(fixture.named('SpaceSettingsDeleteLink').map(r => r.variables)).toEqual([{ id: 'link-2' }]);
    expect(fixture.named('SpaceSettingsUpdateAbout')).toHaveLength(0);
  });

  it('holds a new reference with a URL but no title as an unsaved, unsavable change instead of dropping it', async () => {
    const { result } = renderAbout({ SpaceSettingsAbout: [about([], { links: [] })] });
    await waitFor(() => expect(result.current.values).not.toBeNull());

    act(() => result.current.onReferencesChange([{ name: '', uri: 'https://example.org', description: '' }]));
    expect(result.current.unsaved.count).toBe(1);
    expect(result.current.unsaved.canSave).toBe(false);

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });
    expect(ok).toBe(false);
    expect(result.current.values?.references.map(r => r.uri)).toEqual(['https://example.org']);
  });

  it('reset puts the changed fields back without a request', async () => {
    const fixture = renderAbout({ SpaceSettingsAbout: [about([])] });
    await waitFor(() => expect(fixture.result.current.values).not.toBeNull());

    act(() => fixture.result.current.onChange({ name: 'Renamed' }));
    act(() => fixture.result.current.unsaved.reset());

    expect(fixture.result.current.values?.name).toBe('Test Space');
    expect(fixture.result.current.unsaved.count).toBe(0);
    expect(fixture.requests).toHaveLength(1);
  });
});

describe('useAboutTabData — staged classifications (spec 024 Session 2026-10-22)', () => {
  it('writes a staged add, then its picks and hidden flag on the created entry', async () => {
    const created = classification('entry-9', { label: 'Goals' });
    const fixture = renderAbout({
      SpaceSettingsAbout: [
        about([]),
        about([created]),
        about([classification('entry-9', { label: 'Goals', selected: ['entry-9-climate'], visible: false })]),
      ],
      SpaceSettingsAddClassification: [
        {
          addClassification: {
            __typename: 'BlueprintResult',
            node: { __typename: 'Space', id: SPACE_ID, entityType: 'space' },
          },
        },
      ],
      SpaceSettingsUpdateClassification: [{ updateClassification: spaceResult }],
    });
    const { result } = fixture;
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.addClassificationFromTemplate(SDGS_TEMPLATE);
    });
    const tempId = result.current.unsavedClassificationIds[0];
    act(() => result.current.updateClassificationSelection(tempId, ['tpl-climate']));
    act(() => result.current.updateClassificationDisplay(tempId, false));
    expect(result.current.unsaved.count).toBe(1);

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(true);
    expect(fixture.named('SpaceSettingsAddClassification').map(r => r.variables)).toEqual([
      { space: SPACE_ID, template: 'tpl-sdgs', label: 'Goals' },
    ]);
    expect(fixture.named('SpaceSettingsUpdateClassification').map(r => r.variables)).toEqual([
      { id: 'entry-9', selected: ['entry-9-climate'], settings: { selection: 'many', order: 0, visible: false } },
    ]);
    await waitFor(() =>
      expect(result.current.classifications).toEqual([
        expect.objectContaining({ id: 'entry-9', selectedValueIDs: ['entry-9-climate'], display: false }),
      ])
    );
    expect(result.current.unsaved.count).toBe(0);
  });

  it('shows a label collision refused by the server as the conflict message', async () => {
    const fixture = renderAbout({
      SpaceSettingsAbout: [about([]), about([])],
      SpaceSettingsAddClassification: [
        { errors: [new GraphQLError('conflict', { extensions: { code: 'CONFLICT' } })] },
      ],
    });
    const { result } = fixture;
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.addClassificationFromTemplate(SDGS_TEMPLATE);
    });

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(false);
    expect(result.current.unsaved.error).toBe(
      i18n.t('classifications.picker.conflict.title', { ns: 'crd-spaceSettings' })
    );
    expect(result.current.unsaved.count).toBe(1);
  });

  it('rejects a pick whose label collides with an existing classification after FR-011c normalisation', async () => {
    const { result } = renderAbout({ SpaceSettingsAbout: [about([classification('entry-1', { label: 'Goals' })])] });
    await waitFor(() => expect(result.current.classifications).toHaveLength(1));

    let ok: boolean | undefined;
    act(() => {
      ok = result.current.addClassificationFromTemplate(SDGS_TEMPLATE, '  goals ');
    });

    expect(ok).toBe(false);
    expect(result.current.classificationConflict).toEqual({ templateId: 'tpl-sdgs', attemptedLabel: '  goals ' });
    expect(result.current.unsaved.count).toBe(0);
  });

  it('stages a removal without a request and Discard brings the classification back', async () => {
    const fixture = renderAbout({ SpaceSettingsAbout: [about([classification('entry-1')])] });
    await waitFor(() => expect(fixture.result.current.classifications).toHaveLength(1));

    act(() => fixture.result.current.removeClassification('entry-1'));
    expect(fixture.result.current.classifications).toHaveLength(0);
    expect(fixture.result.current.unsaved.count).toBe(1);

    act(() => fixture.result.current.unsaved.reset());
    expect(fixture.result.current.classifications).toHaveLength(1);
    expect(fixture.requests).toHaveLength(1);
  });

  it('keeps only the failed change counted when part of the Save fails', async () => {
    const fixture = renderAbout({
      SpaceSettingsAbout: [
        about([classification('entry-1'), classification('entry-2', { label: 'Sector' })]),
        about([classification('entry-1')]),
      ],
      SpaceSettingsRemoveClassification: [{ removeClassification: spaceResult }],
      SpaceSettingsUpdateClassification: [{ errors: [new GraphQLError('Selection rejected')] }],
    });
    const { result } = fixture;
    await waitFor(() => expect(result.current.classifications).toHaveLength(2));

    act(() => result.current.removeClassification('entry-2'));
    act(() => result.current.updateClassificationSelection('entry-1', ['entry-1-climate']));
    act(() => result.current.updateClassificationDisplay('entry-1', false));
    expect(result.current.unsaved.count).toBe(2);

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(false);
    expect(result.current.unsaved.error).toMatch(/Selection rejected/);
    expect(fixture.named('SpaceSettingsRemoveClassification').map(r => r.variables)).toEqual([{ id: 'entry-2' }]);
    expect(fixture.named('SpaceSettingsUpdateClassification').map(r => r.variables)).toEqual([
      { id: 'entry-1', selected: ['entry-1-climate'], settings: { selection: 'many', order: 0, visible: false } },
    ]);
    await waitFor(() => expect(result.current.unsaved.count).toBe(1));
    expect(result.current.classifications).toEqual([
      expect.objectContaining({ id: 'entry-1', selectedValueIDs: ['entry-1-climate'], display: false }),
    ]);
  });

  it('reports the Save as failed when the refresh after the writes fails, so the page offers a reload', async () => {
    const fixture = renderAbout({
      SpaceSettingsAbout: [about([classification('entry-1')]), new Error('Network down')],
      SpaceSettingsRemoveClassification: [{ removeClassification: spaceResult }],
    });
    const { result } = fixture;
    await waitFor(() => expect(result.current.classifications).toHaveLength(1));
    act(() => result.current.removeClassification('entry-1'));

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(false);
    expect(result.current.unsaved.error).toBe('Network down');
  });
});
