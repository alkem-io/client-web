import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { print } from 'graphql';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  CreateSpacePickerCardFragment,
  CreateSpacePickerLibraryQuery,
  CreateSpacePickerSpaceTemplatesQuery,
  CreateSpaceTemplateContentQuery,
  CreateSubspaceTemplateDefaultQuery,
} from '@/core/apollo/generated-v2/graphql-schema';

const notifyMock = vi.fn();
const logErrorMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notifyMock }));
vi.mock('@/core/logging/sentry/log', () => ({ error: (e: unknown) => logErrorMock(e) }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { exists: () => false } }),
}));

import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { type UseSpaceTemplatePickerArgs, useSpaceTemplatePicker } from './useSpaceTemplatePicker';
import { useSubspaceDefaultTemplate } from './useSubspaceDefaultTemplate';

type Request = { operationName: string; variables: Record<string, unknown>; query: string };
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
              observer.next({ data });
              observer.complete();
            }
          }, 0);
          return () => clearTimeout(timer);
        })
    ),
  });
  const wrapper = ({ children }: PropsWithChildren) => <ApolloProvider client={apollo}>{children}</ApolloProvider>;
  return { requests, wrapper };
}

const file = (url: string) => ({ __typename: 'FileRef' as const, file: { __typename: 'File' as const, url } });

const cardFields = (id: string, bodyCard: string | null = null): CreateSpacePickerCardFragment => ({
  __typename: 'Template',
  id,
  kind: 'SPACE',
  url: `/templates/${id}`,
  tags: [],
  about: { __typename: 'About', displayName: id, description: null, card: file(`/${id}-card`) },
  body: {
    __typename: 'Space',
    id: `${id}-body`,
    about: { __typename: 'About', card: bodyCard ? file(bodyCard) : null },
  },
});

const libraryPage = (
  templates: Array<{ id: string; pack: string; provider?: string }>,
  endCursor: string | null
): CreateSpacePickerLibraryQuery => ({
  library: {
    __typename: 'NodeConnection',
    edges: templates.map(({ id, pack, provider }) => ({
      __typename: 'NodeEdge',
      node: {
        ...cardFields(id),
        scope: { __typename: 'InnovationPack', id: `${pack}-id`, about: { __typename: 'About', displayName: pack } },
        provider: provider
          ? { __typename: 'Organization', id: `${provider}-id`, about: { __typename: 'About', displayName: provider } }
          : null,
      },
    })),
    pageInfo: { __typename: 'PageInfo', hasNextPage: endCursor !== null, endCursor },
  },
});

const spaceTemplates: CreateSpacePickerSpaceTemplatesQuery = {
  templates: [cardFields('own', '/own-body-card')],
};

const pickerReply: Reply = ({ operationName, variables }) => {
  if (operationName === 'CreateSpacePickerSpaceTemplates') return spaceTemplates;
  if (operationName !== 'CreateSpacePickerLibrary') return undefined;
  if (variables.scope === 'account') return libraryPage([{ id: 'acc', pack: 'Account pack' }], null);
  if (!variables.after) return libraryPage([{ id: 'p1', pack: 'Platform pack', provider: 'Provider' }], 'cursor-1');
  if (variables.after === 'cursor-1') return libraryPage([{ id: 'p2', pack: 'Second pack' }], null);
  return undefined;
};

const renderPicker = (args: UseSpaceTemplatePickerArgs, reply: Reply = pickerReply) => {
  const fixture = client(reply);
  const hook = renderHook(() => useSpaceTemplatePicker(args), { wrapper: fixture.wrapper });
  return { ...hook, requests: fixture.requests };
};

describe('useSpaceTemplatePicker sources', () => {
  it('sends nothing until the picker is open', async () => {
    const fixture = renderPicker({ rootSpaceId: 'root', accountId: 'account' });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    expect(fixture.requests).toEqual([]);
    expect(fixture.result.current.pickerProps.sources.map(source => source.key)).toEqual([
      'space',
      'account',
      'platform',
    ]);
  });

  it('loads the space, account and platform sources and follows the library pages', async () => {
    const fixture = renderPicker({ rootSpaceId: 'root', accountId: 'account' });
    act(() => fixture.result.current.openPicker());
    await waitFor(() =>
      expect(fixture.result.current.pickerProps.sources.find(s => s.key === 'platform')?.loading).toBe(false)
    );

    const sent = fixture.requests.map(({ operationName, variables }) => ({ operationName, variables }));
    expect(sent).toEqual(
      expect.arrayContaining([
        { operationName: 'CreateSpacePickerSpaceTemplates', variables: { space: 'root' } },
        { operationName: 'CreateSpacePickerLibrary', variables: { scope: 'account' } },
        { operationName: 'CreateSpacePickerLibrary', variables: {} },
        { operationName: 'CreateSpacePickerLibrary', variables: { after: 'cursor-1' } },
      ])
    );
    expect(sent).toHaveLength(4);
    const library = fixture.requests.find(r => r.operationName === 'CreateSpacePickerLibrary')?.query;
    expect(library).toContain('library(\n    filter: {itemType: TEMPLATE, kinds: [SPACE], scope: $scope}');
    expect(library).toContain('first: 20');
    expect(fixture.requests.find(r => r.operationName === 'CreateSpacePickerSpaceTemplates')?.query).toContain(
      'templates(scope: $space, kind: SPACE)'
    );

    const sources = fixture.result.current.pickerProps.sources;
    expect(sources.map(source => source.key)).toEqual(['space', 'account', 'platform']);
    expect(sources[0].templates.map(t => [t.id, t.ownerLabel, t.bannerUrl])).toEqual([
      ['own', undefined, '/own-body-card'],
    ]);
    expect(sources[1].templates.map(t => [t.id, t.ownerLabel, t.bannerUrl])).toEqual([
      ['acc', 'Account pack', '/acc-card'],
    ]);
    expect(sources[2].templates.map(t => [t.id, t.ownerLabel])).toEqual([
      ['p1', 'Provider'],
      ['p2', 'Second pack'],
    ]);
    expect(fixture.result.current.pickerProps).toMatchObject({
      mode: 'select',
      open: true,
      allowedTypes: ['space'],
      selectedId: undefined,
      loading: false,
    });
  });

  it('offers only the platform source without a root space or an account', async () => {
    const fixture = renderPicker({});
    act(() => fixture.result.current.openPicker());
    await waitFor(() => expect(fixture.result.current.pickerProps.sources[0].templates).toHaveLength(2));
    expect(fixture.result.current.pickerProps.sources.map(source => source.key)).toEqual(['platform']);
    expect(fixture.requests.map(r => r.variables)).toEqual([{}, { after: 'cursor-1' }]);
  });
});

type ContentNode = NonNullable<CreateSpaceTemplateContentQuery['subtree']>['edges'][number]['node'];
const contentPage = (nodes: ContentNode[], endCursor: string | null): CreateSpaceTemplateContentQuery => ({
  node: {
    __typename: 'Template',
    id: 'tpl',
    tags: ['template-tag'],
    about: { __typename: 'About', displayName: 'Template name', description: 'Template description' },
    body: { __typename: 'Space', id: 'body' },
  },
  subtree: {
    __typename: 'NodeConnection',
    edges: nodes.map(node => ({ __typename: 'NodeEdge', node })),
    pageInfo: { __typename: 'PageInfo', hasNextPage: endCursor !== null, endCursor },
  },
});
const contentSpace = (id: string, displayName: string, stages: Array<[string, number]> = []): ContentNode => ({
  __typename: 'Space',
  id,
  entityType: 'space',
  tags: [],
  isContentPublic: true,
  about: { __typename: 'About', displayName, tagline: `${displayName} tagline`, description: null, card: null },
  stages: stages.map(([name, sortOrder]) => ({ __typename: 'Stage', name, description: null, sortOrder })),
});
const contentPost = (id: string, sortOrder: number): ContentNode => ({
  __typename: 'Post',
  id,
  entityType: 'post',
  contentKind: 'poll',
  sortOrder,
  about: { __typename: 'About', displayName: id, description: null },
  stage: { __typename: 'Stage', name: 'Phase' },
});

const contentReply: Reply = ({ operationName, variables }) => {
  if (operationName !== 'CreateSpaceTemplateContent') return pickerReply({ operationName, variables, query: '' });
  if (variables.template === 'missing') return { node: null, subtree: null };
  if (!variables.after) return contentPage([contentSpace('child', 'Child'), contentPost('later', 2)], 'page-2');
  return contentPage([contentSpace('body', 'Body name', [['Phase', 1]]), contentPost('earlier', 1)], null);
};

describe('useSpaceTemplatePicker template content', () => {
  it('follows the subtree pages and maps the body, children, callouts and prefill', async () => {
    const fixture = renderPicker({}, contentReply);
    let fetched: Awaited<ReturnType<typeof fixture.result.current.fetchSpaceTemplate>>;
    await act(async () => {
      fetched = await fixture.result.current.fetchSpaceTemplate('tpl');
    });
    expect(fixture.requests.map(r => [r.operationName, r.variables])).toEqual([
      ['CreateSpaceTemplateContent', { template: 'tpl' }],
      ['CreateSpaceTemplateContent', { template: 'tpl', after: 'page-2' }],
    ]);
    expect(fixture.requests[0].query).toContain(
      'subtree(\n    root: $template\n    maxDepth: 2\n    types: ["space", "post"]\n    first: 500\n    after: $after\n  )'
    );
    expect(fetched).toEqual({
      content: {
        type: 'space',
        phases: [{ name: 'Phase', description: undefined }],
        starterCallouts: [
          { name: 'earlier', framingKind: 'poll', flowStateName: 'Phase', description: undefined },
          { name: 'later', framingKind: 'poll', flowStateName: 'Phase', description: undefined },
        ],
        subspaceTemplates: [{ id: 'child', name: 'Child', bannerUrl: undefined, isPrivate: false }],
      },
      prefill: {
        templateName: 'Template name',
        displayName: 'Body name',
        tagline: 'Body name tagline',
        description: 'Template description',
        tags: ['template-tag'],
      },
    });
  });

  it('answers undefined for a template the caller cannot read', async () => {
    const fixture = renderPicker({}, contentReply);
    await act(async () => {
      expect(await fixture.result.current.fetchSpaceTemplate('missing')).toBeUndefined();
    });
  });

  it('previews and selects through the same content read, closing on select', async () => {
    const openChanges: boolean[] = [];
    const fixture = renderPicker({ onOpenChange: next => openChanges.push(next) }, contentReply);
    act(() => fixture.result.current.openPicker());
    act(() => fixture.result.current.pickerProps.onPreview('tpl'));
    expect(fixture.result.current.pickerProps.previewLoading).toBe(true);
    await waitFor(() => expect(fixture.result.current.pickerProps.previewLoading).toBe(false));
    expect(fixture.result.current.pickerProps.previewId).toBe('tpl');
    expect(fixture.result.current.pickerProps.previewContent).toMatchObject({
      type: 'space',
      phases: [{ name: 'Phase' }],
    });

    act(() => fixture.result.current.pickerProps.onSelect('tpl'));
    expect(fixture.result.current.selectedTemplateId).toBe('tpl');
    expect(fixture.result.current.selectedTemplateContent).toBeNull();
    expect(fixture.result.current.pickerProps.open).toBe(false);
    await waitFor(() => expect(fixture.result.current.selectedTemplateContent).toMatchObject({ type: 'space' }));

    act(() => fixture.result.current.pickerProps.onSelect(null));
    expect(fixture.result.current.selectedTemplateId).toBeNull();
    expect(openChanges).toEqual([true, false, false]);
  });

  afterEach(() => {
    notifyMock.mockReset();
    logErrorMock.mockReset();
  });

  it('reports a failed preview read and keeps the picker usable (legacy error-link parity)', async () => {
    const fixture = renderPicker({}, () => undefined);
    act(() => fixture.result.current.pickerProps.onPreview('broken'));
    await waitFor(() => expect(fixture.result.current.pickerProps.previewLoading).toBe(false));
    expect(fixture.result.current.pickerProps.previewContent).toBeUndefined();
    expect(notifyMock).toHaveBeenCalledWith('apollo.errors.network.generic', 'error');
  });

  it('drops a pick whose template is not readable', async () => {
    const fixture = renderPicker({}, contentReply);
    act(() => fixture.result.current.pickerProps.onSelect('missing'));
    expect(fixture.result.current.selectedTemplateId).toBe('missing');
    await waitFor(() => expect(fixture.result.current.selectedTemplateId).toBeNull());
  });
});

describe('useSubspaceDefaultTemplate', () => {
  const defaults = (template: { id: string; name: string } | null): CreateSubspaceTemplateDefaultQuery => ({
    templateDefaults: [
      {
        __typename: 'TemplateDefault',
        slot: 'space_l0',
        template: { __typename: 'Template', id: 'l0', about: { __typename: 'About', displayName: 'L0' } },
      },
      {
        __typename: 'TemplateDefault',
        slot: 'subspace_default',
        template: template
          ? { __typename: 'Template', id: template.id, about: { __typename: 'About', displayName: template.name } }
          : null,
      },
    ],
  });

  it('preselects the root binding of the subspace_default slot', async () => {
    const fixture = client(() => defaults({ id: 'sub', name: 'Subspace template' }));
    const { result } = renderHook(() => useSubspaceDefaultTemplate('root', false), { wrapper: fixture.wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toEqual({ templateId: 'sub', templateName: 'Subspace template', loading: false });
    expect(fixture.requests.map(r => [r.operationName, r.variables])).toEqual([
      ['CreateSubspaceTemplateDefault', { root: 'root' }],
    ]);
  });

  it('preselects nothing when the bound template is masked', async () => {
    const fixture = client(() => defaults(null));
    const { result } = renderHook(() => useSubspaceDefaultTemplate('root', false), { wrapper: fixture.wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toEqual({ templateId: undefined, templateName: undefined, loading: false });
  });

  it('sends nothing when skipped or without a root', async () => {
    const fixture = client(() => defaults(null));
    renderHook(() => useSubspaceDefaultTemplate('root', true), { wrapper: fixture.wrapper });
    renderHook(() => useSubspaceDefaultTemplate(undefined, false), { wrapper: fixture.wrapper });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    expect(fixture.requests).toEqual([]);
  });
});
