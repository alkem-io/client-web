import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { print } from 'graphql';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NativeSubspaceCardFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';

const handleError = vi.fn();
vi.mock('@/core/apollo/hooks/useApolloErrorHandler', () => ({ useApolloErrorHandler: () => handleError }));

import { useSubspacesTabData } from './useSubspacesTabData';

type Sent = { operationName: string; variables: Record<string, unknown>; query: string };
type Reply = (variables: Record<string, unknown>) => { data?: unknown; errors?: unknown[] };

const child = (id: string, pinned = false): NativeSubspaceCardFragment => ({
  __typename: 'Space',
  id,
  url: `/space/${id}`,
  status: 'ACTIVE',
  isContentPublic: true,
  pinned,
  tags: [],
  about: { __typename: 'About', displayName: `Space ${id}`, tagline: null, avatar: null, card: null },
  membership: null,
  can: { __typename: 'SpaceCan', read: true },
  leads: [],
});

const subspaces =
  (sortMode: 'custom' | 'alphabetical', children: NativeSubspaceCardFragment[]): Reply =>
  variables => ({
    data: {
      node: { __typename: 'Space', id: variables.root, entityType: 'space', settings: { sort_mode: sortMode } },
      spaces: {
        __typename: 'SpaceConnection',
        edges: children.map(node => ({ __typename: 'SpaceEdge', cursor: `c-${node.id}`, node })),
        pageInfo: { __typename: 'PageInfo', hasNextPage: false, endCursor: null },
        totalCount: children.length,
      },
    },
  });

const templateDefaults: Reply = () => ({
  data: {
    templateDefaults: [
      {
        __typename: 'TemplateDefault',
        slot: 'subspace_default',
        template: { __typename: 'Template', id: 'tpl-default', about: { __typename: 'About', displayName: 'Default' } },
      },
    ],
  },
});

function setup(replies: Record<string, Reply[]>) {
  const sent: Sent[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          sent.push({
            operationName: operation.operationName,
            variables: operation.variables,
            query: print(operation.query),
          });
          const reply = replies[operation.operationName]?.shift();
          setTimeout(() => {
            if (!reply) observer.error(new Error(`Unexpected ${operation.operationName}`));
            else {
              observer.next(reply(operation.variables) as never);
              observer.complete();
            }
          }, 0);
        })
    ),
  });
  const wrapper = ({ children }: PropsWithChildren) => <ApolloProvider client={client}>{children}</ApolloProvider>;
  const hook = renderHook(() => useSubspacesTabData('parent'), { wrapper });
  return { ...hook, sent };
}

const ops = (sent: Sent[], name: string) => sent.filter(s => s.operationName === name);

describe('useSubspacesTabData (native)', () => {
  beforeEach(() => handleError.mockReset());

  it('lists NativeSubspaces in server order with the parent sort_mode and the subspace_default binding', async () => {
    const fixture = setup({
      NativeSubspaces: [subspaces('custom', [child('b'), child('a', true)])],
      CreateSubspaceTemplateDefault: [templateDefaults],
    });
    await waitFor(() => expect(fixture.result.current.loading).toBe(false));

    expect(ops(fixture.sent, 'NativeSubspaces')[0].variables).toEqual({ root: 'parent', first: 500 });
    expect(ops(fixture.sent, 'CreateSubspaceTemplateDefault')[0].variables).toEqual({ root: 'parent' });
    expect(fixture.result.current.subspaces.map(s => [s.id, s.isPinned])).toEqual([
      ['b', false],
      ['a', true],
    ]);
    expect(fixture.result.current.sortMode).toBe('manual');
    expect(fixture.result.current.defaultTemplateId).toBe('tpl-default');
  });

  it('pins, reorders, switches sort mode and deletes through the designed mutations, re-reading the list', async () => {
    const fixture = setup({
      NativeSubspaces: [
        subspaces('alphabetical', [child('a'), child('b')]),
        subspaces('alphabetical', [child('a', true), child('b')]),
        subspaces('custom', [child('b'), child('a', true)]),
        subspaces('custom', [child('b'), child('a', true)]),
        subspaces('custom', [child('a', true)]),
      ],
      CreateSubspaceTemplateDefault: [templateDefaults],
      PinSpaceSettingsSubspace: [
        v => ({ data: { pinSubspace: { __typename: 'Space', id: v.id, pinned: v.pinned, sortOrder: 0 } } }),
      ],
      UpdateSpaceSettingsSubspacesSortMode: [
        v => ({ data: { updateSpace: { __typename: 'Space', id: v.id, settings: v.settings } } }),
      ],
      ReorderSpaceSettingsSubspaces: [v => ({ data: { reorderSubspaces: { __typename: 'Space', id: v.parent } } })],
      DeleteSpaceSettingsSubspace: [v => ({ data: { deleteSpace: { __typename: 'DeleteResult', deletedId: v.id } } })],
    });
    await waitFor(() => expect(fixture.result.current.subspaces).toHaveLength(2));

    act(() => fixture.result.current.onKebabAction('a', 'pinToggle'));
    await waitFor(() => expect(ops(fixture.sent, 'NativeSubspaces')).toHaveLength(2));
    act(() => fixture.result.current.onSortModeChange('manual'));
    await waitFor(() => expect(ops(fixture.sent, 'NativeSubspaces')).toHaveLength(3));
    act(() => fixture.result.current.onReorder(['b', 'a']));
    await waitFor(() => expect(ops(fixture.sent, 'NativeSubspaces')).toHaveLength(4));
    act(() => fixture.result.current.onKebabAction('b', 'delete'));
    expect(fixture.result.current.pendingDelete).toEqual({ id: 'b', name: 'Space b' });
    act(() => fixture.result.current.confirmDelete());
    await waitFor(() => expect(fixture.result.current.subspaces.map(s => s.id)).toEqual(['a']));

    expect(ops(fixture.sent, 'PinSpaceSettingsSubspace')[0].variables).toEqual({ id: 'a', pinned: true });
    expect(ops(fixture.sent, 'UpdateSpaceSettingsSubspacesSortMode')[0].variables).toEqual({
      id: 'parent',
      settings: { sort_mode: 'custom' },
    });
    expect(ops(fixture.sent, 'ReorderSpaceSettingsSubspaces')[0].variables).toEqual({
      parent: 'parent',
      ids: ['b', 'a'],
    });
    expect(ops(fixture.sent, 'DeleteSpaceSettingsSubspace')[0].variables).toEqual({ id: 'b' });
    expect(handleError).not.toHaveBeenCalled();
  });

  it('sets the default subspace template on the subspace_default slot from the scope SPACE templates', async () => {
    const fixture = setup({
      NativeSubspaces: [subspaces('alphabetical', [])],
      CreateSubspaceTemplateDefault: [templateDefaults, templateDefaults],
      SpaceSettingsSubspaceTemplates: [
        () => ({
          data: {
            templates: [
              { __typename: 'Template', id: 'tpl-1', about: { __typename: 'About', displayName: 'Template one' } },
            ],
          },
        }),
      ],
      SetSpaceSettingsSubspaceDefaultTemplate: [
        () => ({
          data: {
            setTemplateDefault: [
              {
                __typename: 'TemplateDefault',
                slot: 'subspace_default',
                template: {
                  __typename: 'Template',
                  id: 'tpl-1',
                  about: { __typename: 'About', displayName: 'Template one' },
                },
              },
            ],
          },
        }),
      ],
    });
    await waitFor(() => expect(fixture.result.current.loading).toBe(false));

    act(() => fixture.result.current.onChangeDefaultTemplate());
    await waitFor(() =>
      expect(fixture.result.current.subspaceTemplateChoices).toEqual([{ id: 'tpl-1', name: 'Template one' }])
    );
    expect(ops(fixture.sent, 'SpaceSettingsSubspaceTemplates')[0].variables).toEqual({ space: 'parent' });

    act(() => fixture.result.current.onSelectDefaultTemplate('tpl-1'));
    await waitFor(() => expect(ops(fixture.sent, 'CreateSubspaceTemplateDefault')).toHaveLength(2));
    const write = ops(fixture.sent, 'SetSpaceSettingsSubspaceDefaultTemplate')[0];
    expect(write.variables).toEqual({ scope: 'parent', template: 'tpl-1' });
    expect(write.query).toContain('slot: "subspace_default"');
  });

  it('shows a refused delete through useApolloErrorHandler', async () => {
    const fixture = setup({
      NativeSubspaces: [subspaces('custom', [child('a')])],
      CreateSubspaceTemplateDefault: [templateDefaults],
      DeleteSpaceSettingsSubspace: [
        () => ({ errors: [{ message: 'has subspaces', extensions: { code: 'FORBIDDEN' } }] }),
      ],
    });
    await waitFor(() => expect(fixture.result.current.subspaces).toHaveLength(1));

    act(() => fixture.result.current.onKebabAction('a', 'delete'));
    act(() => fixture.result.current.confirmDelete());
    await waitFor(() => expect(handleError).toHaveBeenCalledTimes(1));
  });
});
