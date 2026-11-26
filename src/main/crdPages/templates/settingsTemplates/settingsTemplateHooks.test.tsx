import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { print } from 'graphql';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  SettingsPostTemplateContentQuery,
  SettingsPostTemplateLibraryQuery,
  SettingsSaveAsSourceQuery,
} from '@/core/apollo/generated-v2/graphql-schema';

const notifyMock = vi.fn();
const logErrorMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notifyMock }));
vi.mock('@/core/logging/sentry/log', () => ({ error: (e: unknown) => logErrorMock(e) }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { exists: () => false } }),
}));

import { SettingsPostTemplatesDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { useSettingsPostTemplatePicker } from './useSettingsPostTemplatePicker';
import { useSettingsSaveSpaceAsTemplate } from './useSettingsSaveSpaceAsTemplate';
import { useStageDefaultTemplate } from './useStageDefaultTemplate';

type Request = { operationName: string; variables: Record<string, unknown>; query: string };
/** The reply's data; `undefined` fails the request at the network, `{ errors }` answers GraphQL errors. */
type Reply = (request: Request) => unknown;

function client(reply: Reply) {
  const requests: Request[] = [];
  const apollo = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          const request = {
            operationName: operation.operationName,
            variables: operation.variables,
            query: print(operation.query),
          };
          requests.push(request);
          const timer = setTimeout(() => {
            const data = reply(request);
            if (data === undefined) observer.error(new Error(`Unexpected ${request.operationName}`));
            else {
              observer.next(
                typeof data === 'object' && data !== null && 'errors' in data
                  ? (data as { errors: { message: string }[] })
                  : { data: data as Record<string, unknown> }
              );
              observer.complete();
            }
          }, 0);
          return () => clearTimeout(timer);
        })
    ),
  });
  const wrapper = ({ children }: PropsWithChildren) => <ApolloProvider client={apollo}>{children}</ApolloProvider>;
  return { requests, wrapper, apollo };
}

const sent = (requests: Request[]) => requests.map(({ operationName, variables }) => [operationName, variables]);

afterEach(() => {
  notifyMock.mockReset();
  logErrorMock.mockReset();
});

// ---------------------------------------------------------------------------- post template picker

const postCard = (id: string) => ({
  __typename: 'Template' as const,
  id,
  kind: 'POST' as const,
  url: `/t/${id}`,
  tags: [],
  about: { __typename: 'About' as const, displayName: id, description: null, card: null },
});

const libraryPage = (ids: string[], endCursor: string | null): SettingsPostTemplateLibraryQuery => ({
  library: {
    __typename: 'NodeConnection',
    edges: ids.map(id => ({
      __typename: 'NodeEdge',
      node: {
        ...postCard(id),
        scope: { __typename: 'InnovationPack', id: 'pack', about: { __typename: 'About', displayName: 'Pack' } },
        provider: null,
      },
    })),
    pageInfo: { __typename: 'PageInfo', hasNextPage: endCursor !== null, endCursor },
  },
});

const postContent: SettingsPostTemplateContentQuery = {
  node: {
    __typename: 'Template',
    id: 'tpl',
    kind: 'POST',
    body: {
      __typename: 'Post',
      id: 'body',
      about: { __typename: 'About', displayName: 'Ideas', description: 'Share' },
      contentKind: 'text',
      links: [],
      responseKind: 'text',
      responsePolicy: { accept_new: true },
      responseDefaults: { description: 'Describe it' },
      commentsEnabled: true,
      content: null,
    },
  },
  subtree: {
    __typename: 'NodeConnection',
    edges: [],
    pageInfo: { __typename: 'PageInfo', hasNextPage: false, endCursor: null },
  },
};

const pickerReply: Reply = ({ operationName, variables }) => {
  if (operationName === 'SettingsPostTemplates') return { templates: [postCard('own')] };
  if (operationName === 'SettingsPostTemplateLibrary') {
    if (variables.scope === 'account') return libraryPage(['acc'], null);
    if (!variables.after) return libraryPage(['p1'], 'cursor-1');
    return libraryPage(['p2'], null);
  }
  if (operationName === 'SettingsPostTemplateContent') {
    return variables.template === 'tpl' ? postContent : { node: null, subtree: null };
  }
  return undefined;
};

describe('useSettingsPostTemplatePicker', () => {
  it('reads nothing while closed, then the root POST templates and the account and platform POST library', async () => {
    const fixture = client(pickerReply);
    const { result } = renderHook(() => useSettingsPostTemplatePicker({ rootSpaceId: 'root', accountId: 'account' }), {
      wrapper: fixture.wrapper,
    });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    expect(fixture.requests).toEqual([]);

    act(() => result.current.openPicker());
    await waitFor(() => expect(result.current.pickerProps.sources.every(source => !source.loading)).toBe(true));
    expect(sent(fixture.requests)).toEqual(
      expect.arrayContaining([
        ['SettingsPostTemplates', { space: 'root' }],
        ['SettingsPostTemplateLibrary', { scope: 'account' }],
        ['SettingsPostTemplateLibrary', {}],
        ['SettingsPostTemplateLibrary', { after: 'cursor-1' }],
      ])
    );
    expect(fixture.requests).toHaveLength(4);
    expect(fixture.requests.find(r => r.operationName === 'SettingsPostTemplates')?.query).toContain(
      'templates(scope: $space, kind: POST)'
    );
    expect(fixture.requests.find(r => r.operationName === 'SettingsPostTemplateLibrary')?.query).toContain(
      'library(\n    filter: {itemType: TEMPLATE, kinds: [POST], scope: $scope}'
    );
    const { sources } = result.current.pickerProps;
    expect(
      sources.map(source => [source.key, source.templates.map(card => [card.id, card.type, card.ownerLabel])])
    ).toEqual([
      ['space', [['own', 'callout', undefined]]],
      ['account', [['acc', 'callout', 'Pack']]],
      [
        'platform',
        [
          ['p1', 'callout', 'Pack'],
          ['p2', 'callout', 'Pack'],
        ],
      ],
    ]);
    expect(result.current.pickerProps.allowedTypes).toEqual(['callout']);
  });

  it('previews and selects through the body read, and drops an unreadable pick', async () => {
    const fixture = client(pickerReply);
    const { result } = renderHook(() => useSettingsPostTemplatePicker({ rootSpaceId: 'root' }), {
      wrapper: fixture.wrapper,
    });
    act(() => result.current.openPicker());
    act(() => result.current.pickerProps.onPreview('tpl'));
    await waitFor(() => expect(result.current.pickerProps.previewLoading).toBe(false));
    const contentRequest = fixture.requests.find(r => r.operationName === 'SettingsPostTemplateContent');
    expect(contentRequest?.variables).toEqual({ template: 'tpl' });
    expect(contentRequest?.query).toContain('subtree(\n    root: $template\n    maxDepth: 2\n    types: ["document"]');
    expect(result.current.pickerProps.previewContent).toMatchObject({
      type: 'callout',
      framingTitle: 'Ideas',
      allowedContributionTypes: ['post'],
      defaultPostDescription: 'Describe it',
    });

    act(() => result.current.pickerProps.onSelect('tpl'));
    expect(result.current.selectedTemplateId).toBe('tpl');
    expect(result.current.pickerProps.open).toBe(false);
    await waitFor(() => expect(result.current.selectedTemplateContent).toMatchObject({ type: 'callout' }));

    act(() => result.current.pickerProps.onSelect('missing'));
    await waitFor(() => expect(result.current.selectedTemplateId).toBeNull());
  });

  it('reports a failed preview read and keeps the picker usable', async () => {
    const fixture = client(({ operationName }) =>
      operationName === 'SettingsPostTemplateContent'
        ? undefined
        : pickerReply({ operationName, variables: {}, query: '' })
    );
    const { result } = renderHook(() => useSettingsPostTemplatePicker({}), { wrapper: fixture.wrapper });
    act(() => result.current.openPicker());
    act(() => result.current.pickerProps.onPreview('tpl'));
    await waitFor(() => expect(result.current.pickerProps.previewLoading).toBe(false));
    expect(result.current.pickerProps.previewContent).toBeUndefined();
    expect(notifyMock).toHaveBeenCalledWith('apollo.errors.network.generic', 'error');
    expect(result.current.pickerProps.open).toBe(true);
  });
});

// ---------------------------------------------------------------------------- stage default

describe('useStageDefaultTemplate', () => {
  const binding = (stage: string, template: string | null) => ({
    __typename: 'TemplateDefault',
    slot: 'stage',
    stage: {
      __typename: 'Stage',
      id: stage,
      defaultTemplate: template
        ? { __typename: 'Template', id: template, about: { __typename: 'About', displayName: 'Post tpl' } }
        : null,
    },
    template: template
      ? { __typename: 'Template', id: template, about: { __typename: 'About', displayName: 'Post tpl' } }
      : null,
  });

  it('sets and clears the stage slot binding of the space and reports the result', async () => {
    const fixture = client(({ variables }) => ({
      setTemplateDefault: variables.template ? [binding('stage-1', variables.template as string)] : [],
    }));
    const saved = vi.fn();
    const { result } = renderHook(() => useStageDefaultTemplate({ spaceId: 'space', onTemplateSaved: saved }), {
      wrapper: fixture.wrapper,
    });

    await act(() => result.current('stage-1', 'tpl'));
    await act(() => result.current('stage-1', null));

    expect(sent(fixture.requests)).toEqual([
      ['SettingsSetStageTemplateDefault', { scope: 'space', stage: 'stage-1', template: 'tpl' }],
      ['SettingsSetStageTemplateDefault', { scope: 'space', stage: 'stage-1', template: null }],
    ]);
    expect(fixture.requests[0].query).toContain(
      'setTemplateDefault(\n    scope: $scope\n    slot: "stage"\n    stage: $stage\n    template: $template\n  )'
    );
    expect(saved.mock.calls).toEqual([
      ['stage-1', { id: 'tpl', displayName: 'Post tpl' }],
      ['stage-1', null],
    ]);
  });

  it('shows a refused write and leaves the column unchanged', async () => {
    const fixture = client(() => ({ errors: [{ message: 'DEFAULT_UNAVAILABLE' }] }));
    const saved = vi.fn();
    const { result } = renderHook(() => useStageDefaultTemplate({ spaceId: 'space', onTemplateSaved: saved }), {
      wrapper: fixture.wrapper,
    });
    await act(() => result.current('stage-1', 'tpl'));
    expect(saved).not.toHaveBeenCalled();
    expect(notifyMock).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------- save space as template

const source = (id: string, canSaveAsTemplate = true): SettingsSaveAsSourceQuery => ({
  node: {
    __typename: 'Space',
    id,
    about: {
      __typename: 'About',
      displayName: `Space ${id}`,
      avatar: { __typename: 'FileRef', file: { __typename: 'File', url: '/avatar' } },
    },
    can: { __typename: 'SpaceCan', saveAsTemplate: canSaveAsTemplate },
  },
  subtree: {
    __typename: 'NodeConnection',
    edges: [
      {
        __typename: 'NodeEdge',
        node: {
          __typename: 'Space',
          id,
          entityType: 'space',
          about: { __typename: 'About', displayName: `Space ${id}`, card: null },
          isContentPublic: true,
          stages: [{ __typename: 'Stage', name: 'Explore', description: null, sortOrder: 1 }],
        },
      },
    ],
    pageInfo: { __typename: 'PageInfo', hasNextPage: false, endCursor: null },
  },
});

const blueprint = (key: string, id: string) => ({
  [key]: { __typename: 'BlueprintResult', node: { __typename: 'Template', id }, omissions: [] },
});

describe('useSettingsSaveSpaceAsTemplate', () => {
  const render = (reply: Reply) => {
    const fixture = client(reply);
    const onSaved = vi.fn();
    const hook = renderHook(() => useSettingsSaveSpaceAsTemplate({ rootSpaceId: 'root', onSaved }), {
      wrapper: fixture.wrapper,
    });
    return { ...hook, requests: fixture.requests, apollo: fixture.apollo, onSaved };
  };

  it('opens pre-filled from the subspace, previews it, and captures it into the top-level space with its tags', async () => {
    const fixture = render(({ operationName, variables }) => {
      if (operationName === 'SettingsSaveAsSource') return source(variables.space as string);
      if (operationName === 'SettingsCreateSpaceTemplate') return blueprint('createTemplate', 'new-tpl');
      if (operationName === 'SettingsUpdateSpaceTemplate') return blueprint('updateTemplate', 'new-tpl');
      return undefined;
    });
    act(() => fixture.result.current.openSaveAs({ spaceId: 'sub', name: 'Sub', description: 'Tagline' }));
    expect(fixture.result.current.form).toMatchObject({
      open: true,
      intent: 'create',
      type: 'space',
      commonValue: { name: 'Sub', description: 'Tagline', tags: [] },
      isDirty: false,
    });
    await waitFor(() => expect(fixture.requests).toHaveLength(1));
    expect(sent(fixture.requests)).toEqual([['SettingsSaveAsSource', { space: 'sub' }]]);
    expect(fixture.requests[0].query).toContain(
      'subtree(\n    root: $space\n    includeRoot: true\n    maxDepth: 1\n    types: ["space", "post"]'
    );

    fixture.apollo.writeQuery({
      query: SettingsPostTemplatesDocument,
      variables: { space: 'root' },
      data: { templates: [] },
    });
    act(() =>
      fixture.result.current.form.onCommonChange({ name: 'Sub template', description: 'Tagline', tags: ['x'] })
    );
    act(() => fixture.result.current.form.onSubmit());
    await waitFor(() => expect(fixture.onSaved).toHaveBeenCalled());

    expect(sent(fixture.requests.slice(1))).toEqual([
      [
        'SettingsCreateSpaceTemplate',
        {
          scope: 'root',
          source: 'sub',
          recursive: true,
          about: { displayName: 'Sub template', description: 'Tagline' },
        },
      ],
      ['SettingsUpdateSpaceTemplate', { id: 'new-tpl', tags: ['x'] }],
    ]);
    expect(fixture.requests[1].query).toContain(
      'createTemplate(\n    scope: $scope\n    kind: SPACE\n    source: $source\n    recursive: $recursive\n    about: $about\n  )'
    );
    expect(fixture.result.current.form.open).toBe(false);
    // The scope's cached template lists are dropped, so the next read asks the server.
    expect(fixture.apollo.readQuery({ query: SettingsPostTemplatesDocument, variables: { space: 'root' } })).toBeNull();
  });

  it('retries a failed tags write on the created template instead of creating another', async () => {
    let tagWrites = 0;
    const fixture = render(({ operationName, variables }) => {
      if (operationName === 'SettingsSaveAsSource') return source(variables.space as string);
      if (operationName === 'SettingsCreateSpaceTemplate') return blueprint('createTemplate', 'new-tpl');
      if (operationName === 'SettingsUpdateSpaceTemplate') {
        tagWrites += 1;
        return tagWrites === 1 ? { errors: [{ message: 'refused' }] } : blueprint('updateTemplate', 'new-tpl');
      }
      return undefined;
    });
    act(() => fixture.result.current.openSaveAs({ spaceId: 'sub', name: 'Sub', description: 'D', tags: ['x'] }));
    act(() => fixture.result.current.form.onSubmit());
    await waitFor(() => expect(tagWrites).toBe(1));
    await waitFor(() => expect(fixture.result.current.form.submitting).toBe(false));
    expect(fixture.result.current.form.open).toBe(true);
    expect(notifyMock).toHaveBeenCalled();

    act(() => fixture.result.current.form.onSubmit());
    await waitFor(() => expect(fixture.onSaved).toHaveBeenCalled());
    expect(sent(fixture.requests).filter(([name]) => name !== 'SettingsSaveAsSource')).toEqual([
      [
        'SettingsCreateSpaceTemplate',
        { scope: 'root', source: 'sub', recursive: true, about: { displayName: 'Sub', description: 'D' } },
      ],
      ['SettingsUpdateSpaceTemplate', { id: 'new-tpl', tags: ['x'] }],
      ['SettingsUpdateSpaceTemplate', { id: 'new-tpl', about: { displayName: 'Sub', description: 'D' }, tags: ['x'] }],
    ]);
  });

  it('validates the name, description and source before writing', () => {
    const fixture = render(() => source('sub'));
    act(() => fixture.result.current.openSaveAs({ spaceId: 'sub', name: ' ', description: '' }));
    act(() => fixture.result.current.form.onSubmit());
    expect(fixture.result.current.form.commonErrors).toEqual({
      name: 'form.common.nameRequired',
      description: 'form.common.descriptionRequired',
    });
  });

  it('picks another source from a pasted URL, refusing non-spaces and spaces without the capture verdict', async () => {
    const resolveTo: Record<string, unknown> = {
      '/post': { state: 'OK', remainder: [], node: { __typename: 'Post', id: 'p', entityType: 'post' } },
      '/locked': { state: 'OK', remainder: [], node: { __typename: 'Space', id: 'locked', entityType: 'space' } },
      '/hidden': { state: 'FORBIDDEN', remainder: [], node: null },
      '/other': { state: 'OK', remainder: [], node: { __typename: 'Space', id: 'other', entityType: 'space' } },
    };
    const fixture = render(({ operationName, variables }) => {
      if (operationName === 'SettingsSaveAsResolveSource') {
        return { resolve: { __typename: 'ResolveResult', ...(resolveTo[variables.url as string] as object) } };
      }
      if (operationName === 'SettingsSaveAsSource')
        return source(variables.space as string, variables.space !== 'locked');
      return undefined;
    });
    act(() => fixture.result.current.openSaveAs({ spaceId: 'sub', name: 'Sub' }));
    const slot = () => fixture.result.current.spaceForm;
    const useUrl = async (url: string) => {
      act(() => slot().onUrlChange(url));
      act(() => slot().onUseUrl());
      await waitFor(() => expect(slot().urlResolving).toBe(false));
    };

    act(() => slot().onUseUrl());
    expect(slot().urlError).toBe('form.space.urlLoader.errors.required');
    await useUrl('/post');
    expect(slot().urlError).toBe('form.space.urlLoader.errors.invalidUrl');
    await useUrl('/hidden');
    expect(slot().urlError).toBe('form.space.urlLoader.errors.noRights');
    await useUrl('/locked');
    expect(slot().urlError).toBe('form.space.urlLoader.errors.noRights');
    await useUrl('/other');
    expect(slot().urlError).toBeUndefined();
    expect(slot().value.sourceSpaceId).toBe('other');
    expect(slot().sourceDisplayName).toBe('Space other');
    expect(
      fixture.requests.filter(r => r.operationName === 'SettingsSaveAsResolveSource').map(r => r.variables)
    ).toEqual([{ url: '/post' }, { url: '/hidden' }, { url: '/locked' }, { url: '/other' }]);
  });
});
