import { ApolloClient, ApolloLink, ApolloProvider, type FetchResult, Observable, type Operation } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { print } from 'graphql';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const notifyMock = vi.fn();
const logErrorMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notifyMock }));
vi.mock('@/core/logging/sentry/log', () => ({ error: (e: unknown) => logErrorMock(e) }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { exists: (key: string) => key === 'apollo.errors.UNAVAILABLE' },
  }),
}));

import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { useSpaceCreation } from './useSpaceCreation/useSpaceCreation';
import { useSubspaceCreation } from './useSubspaceCreation/useSubspaceCreation';

// 023 contracts/create-space.graphql: the selection both client documents send.
const CONTRACT_SELECTION = 'createSpace(input: $input) { node { id ... on Space { url } } omissions { path code } }';
// Apollo's cache adds __typename to every selection it sends; the contract names the rest.
const squash = (text: string) =>
  text
    .replace(/\b__typename\b/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}])\s*/g, '$1')
    .trim();

function setup(result: FetchResult, replies: Record<string, FetchResult> = {}) {
  const operations: Operation[] = [];
  const link = new ApolloLink(operation => {
    operations.push(operation);
    return new Observable(observer => {
      observer.next(replies[operation.operationName] ?? result);
      observer.complete();
    });
  });
  const client = new ApolloClient({ cache: createV2Cache(), link });
  const wrapper = ({ children }: PropsWithChildren) => <ApolloProvider client={client}>{children}</ApolloProvider>;
  return { operations, wrapper };
}

const created = (url: string, omissions: { path: string; code: string }[] = []) => ({
  data: {
    createSpace: {
      __typename: 'BlueprintResult',
      node: { __typename: 'Space', id: 'new-space', url },
      omissions: omissions.map(o => ({ __typename: 'BlueprintOmission', ...o })),
    },
  },
});

describe('space creation documents (023 FR-020)', () => {
  it('sends the L0 CreateSpace document with account, plan, handle, tutorials and the profile blueprint', async () => {
    const { operations, wrapper } = setup(created('/spaces/my-space'));
    const { result } = renderHook(() => useSpaceCreation(), { wrapper });

    let space: Awaited<ReturnType<typeof result.current.createSpace>> | undefined;
    await act(async () => {
      space = await result.current.createSpace({
        accountId: 'account-1',
        nameId: 'my-space',
        planId: 'plan-1',
        profile: { displayName: 'My space', tagline: 'Tag', description: 'Desc', tags: ['climate', 'energy'] },
        addTutorialCallouts: false,
        visuals: {},
      });
    });

    expect(operations).toHaveLength(1);
    expect(operations[0].operationName).toBe('CreateSpace');
    expect(squash(print(operations[0].query))).toContain(squash(CONTRACT_SELECTION));
    expect(operations[0].variables).toEqual({
      input: {
        account: 'account-1',
        plan: 'plan-1',
        handle: 'my-space',
        tutorials: false,
        blueprint: {
          v: 1,
          root: 's',
          nodes: [
            {
              key: 's',
              parent: null,
              type: 'space',
              profile: { display_name: 'My space', tagline: 'Tag', description: 'Desc' },
            },
          ],
          labels: [
            { owner: 's', type: 'core.tags', name: 'tags', value_text: 'climate', sort_order: 0 },
            { owner: 's', type: 'core.tags', name: 'tags', value_text: 'energy', sort_order: 1 },
          ],
        },
      },
    });
    expect(space).toEqual({ id: 'new-space', url: '/spaces/my-space', omissions: [] });
  });

  it('omits template when the picker holds nothing and sends it when it holds one', async () => {
    const { operations, wrapper } = setup(created('/spaces/my-space'));
    const { result } = renderHook(() => useSpaceCreation(), { wrapper });
    const base = {
      accountId: 'account-1',
      nameId: 'my-space',
      planId: undefined,
      profile: { displayName: 'My space', tagline: '', tags: [] },
      addTutorialCallouts: true,
      visuals: {},
    };

    await act(async () => {
      await result.current.createSpace({ ...base, spaceTemplateId: '' });
      await result.current.createSpace({ ...base, spaceTemplateId: 'template-1' });
    });

    const [blank, templated] = operations.map(op => JSON.parse(JSON.stringify(op.variables)).input);
    expect(blank).not.toHaveProperty('template');
    expect(blank).not.toHaveProperty('plan');
    expect(blank.tutorials).toBe(true);
    expect(blank.blueprint.nodes[0].profile).toEqual({ display_name: 'My space', tagline: '' });
    expect(blank.blueprint.labels).toEqual([]);
    expect(templated.template).toBe('template-1');
  });

  it('sends the CreateSubspace document with the parent and no account, plan, handle or tutorials', async () => {
    const { operations, wrapper } = setup(
      created('/spaces/parent/challenges/child', [{ path: 'nodes/s/references/0', code: 'REFERENCE_UNAVAILABLE' }])
    );
    const { result } = renderHook(() => useSubspaceCreation(), { wrapper });

    let space: Awaited<ReturnType<typeof result.current.createSubspace>> | undefined;
    await act(async () => {
      space = await result.current.createSubspace({
        parentId: 'parent-1',
        profile: { displayName: 'My subspace', tagline: 'Tag', tags: [] },
        visuals: {},
        spaceTemplateId: 'template-1',
      });
    });

    expect(operations[0].operationName).toBe('CreateSubspace');
    expect(squash(print(operations[0].query))).toContain(squash(CONTRACT_SELECTION));
    expect(JSON.parse(JSON.stringify(operations[0].variables))).toEqual({
      input: {
        parent: 'parent-1',
        template: 'template-1',
        blueprint: {
          v: 1,
          root: 's',
          nodes: [{ key: 's', parent: null, type: 'space', profile: { display_name: 'My subspace', tagline: 'Tag' } }],
          labels: [],
        },
      },
    });
    expect(space).toEqual({
      id: 'new-space',
      url: '/spaces/parent/challenges/child',
      omissions: [{ path: 'nodes/s/references/0', code: 'REFERENCE_UNAVAILABLE' }],
    });
  });
});

describe('visual upload after creation (023 FR-020; 022 FR-001/FR-002/FR-004)', () => {
  const uploadReplies = {
    RequestVisualUpload: {
      data: {
        requestUpload: {
          __typename: 'UploadToken',
          token: 'signed-token',
          url: 'https://files.test/api/storage/b/files',
        },
      },
    },
    AttachVisual: { data: { attachFile: { __typename: 'Space', id: 'new-space' } } },
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    notifyMock.mockReset();
    logErrorMock.mockReset();
  });

  it('requests an upload on the new space, PUTs the bytes with the token, then attaches the file under its role', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 'file-1', mime: 'image/png', size: 3, reused: false })));
    vi.stubGlobal('fetch', fetchMock);
    const { operations, wrapper } = setup(created('/spaces/parent/challenges/child'), uploadReplies);
    const { result } = renderHook(() => useSubspaceCreation(), { wrapper });
    const avatar = new File(['abc'], 'logo é.png', { type: 'image/png' });

    await act(async () => {
      await result.current.createSubspace({
        parentId: 'parent-1',
        profile: { displayName: 'My subspace', tagline: '', tags: [] },
        visuals: { avatar: { file: avatar, altText: 'A round logo' } },
      });
    });

    expect(operations.map(op => op.operationName)).toEqual(['CreateSubspace', 'RequestVisualUpload', 'AttachVisual']);
    expect(operations[1].variables).toEqual({ owner: 'new-space', mime: 'image/png', size: 3, role: 'avatar' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://files.test/api/storage/b/files');
    expect(init.method).toBe('PUT');
    expect(init.body).toBe(avatar);
    expect(init.headers).toEqual({
      Authorization: 'Bearer signed-token',
      'Content-Type': 'image/png',
      'Content-Disposition': "attachment; filename*=UTF-8''logo%20%C3%A9.png",
    });
    expect(operations[2].variables).toEqual({
      owner: 'new-space',
      file: 'file-1',
      role: 'avatar',
      displayName: 'logo é.png',
      alt: 'A round logo',
    });
    expect(notifyMock).not.toHaveBeenCalled();
  });

  it('keeps the created space and shows the image-upload notice when an upload fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    const { operations, wrapper } = setup(created('/spaces/my-space'), uploadReplies);
    const { result } = renderHook(() => useSpaceCreation(), { wrapper });

    let space: Awaited<ReturnType<typeof result.current.createSpace>> | undefined;
    await act(async () => {
      space = await result.current.createSpace({
        accountId: 'account-1',
        nameId: 'my-space',
        planId: 'plan-1',
        profile: { displayName: 'My space', tagline: '', tags: [] },
        addTutorialCallouts: false,
        visuals: { banner: { file: new File(['x'], 'b.png', { type: 'image/png' }) } },
      });
    });

    expect(space).toEqual({ id: 'new-space', url: '/spaces/my-space', omissions: [] });
    expect(operations.map(op => op.operationName)).toEqual(['CreateSpace', 'RequestVisualUpload']);
    expect(notifyMock).toHaveBeenCalledWith('components.visual-upload.entityCreatedErrorUploading', 'error');
    expect(logErrorMock).toHaveBeenCalledTimes(1);
  });
});

describe('create refusals (023 refusal table; FR-016)', () => {
  afterEach(() => notifyMock.mockReset());

  it('shows the refusal, rethrows so the dialog stays open, and uploads nothing', async () => {
    const { operations, wrapper } = setup({
      // an executed refusal carries its field path (the admission refusal is the pathless one)
      errors: [{ message: 'tutorials wait for WP-W5', path: ['createSpace'], extensions: { code: 'UNAVAILABLE' } }],
    } as FetchResult);
    const { result } = renderHook(() => useSpaceCreation(), { wrapper });

    await act(async () => {
      await expect(
        result.current.createSpace({
          accountId: 'account-1',
          nameId: 'my-space',
          planId: 'plan-1',
          profile: { displayName: 'My space', tagline: '', tags: [] },
          addTutorialCallouts: true,
          visuals: { banner: { file: new File(['x'], 'b.png', { type: 'image/png' }) } },
        })
      ).rejects.toThrow();
    });

    expect((operations[0].variables.input as { tutorials: boolean }).tutorials).toBe(true);
    expect(operations.map(op => op.operationName)).toEqual(['CreateSpace']);
    // Native UNAVAILABLE in the legacy NOT_ENABLED wording (nativeErrorWording.ts), shown once.
    expect(notifyMock).toHaveBeenCalledTimes(1);
    expect(notifyMock).toHaveBeenCalledWith('apollo.errors.userMessages.operations.notEnabled', 'error', undefined);
  });
});
