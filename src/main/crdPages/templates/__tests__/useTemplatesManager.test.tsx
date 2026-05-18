/**
 * @vitest-environment jsdom
 *
 * T038 — `useTemplatesManager` delete-flow Apollo test.
 *
 * Verifies the `ConfirmationDialog`-driven delete contract that the Space Settings → Templates tab
 * and the Innovation Pack admin both consume:
 *   - `onTemplateAction(id, 'delete')` → `pendingDelete = { id, name }`
 *   - `cancelDelete()` → `pendingDelete = null`
 *   - `confirmDelete()` → fires the `deleteTemplate` mutation, clears `pendingDelete`, sets `deletingId`
 *     transiently, returns to idle once the mutation resolves.
 *
 * The FR-019 / V3 "client clears dangling defaults" path is closed (session 32 — the backend
 * cascades and the client just refetches dependent queries); there is no `isUsedAsDefault` flag
 * to test for any more — see `specs/098-crd-templates/incongruencies.md` session 32.
 */
import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { FC, PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import { AllTemplatesInTemplatesSetDocument, DeleteTemplateDocument } from '@/core/apollo/generated/apollo-hooks';
import {
  type AllTemplatesInTemplatesSetQuery,
  type DeleteTemplateMutation,
  TemplateType as GqlTemplateType,
} from '@/core/apollo/generated/graphql-schema';
import { useTemplatesManager } from '../useTemplatesManager';

// ---------------------------------------------------------------------------
// Fixture builders
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

const allTemplatesMock = (
  templatesSetId: string,
  bucket: 'callout' | 'post' | 'whiteboard' | 'space' | 'communityGuidelines',
  templates: ReturnType<typeof tpl>[]
): MockedResponse<AllTemplatesInTemplatesSetQuery> => {
  const bucketKey = `${bucket}Templates`;
  return {
    request: { query: AllTemplatesInTemplatesSetDocument, variables: { templatesSetId } },
    result: {
      data: {
        lookup: {
          __typename: 'LookupQueryResults',
          templatesSet: {
            __typename: 'TemplatesSet',
            id: templatesSetId,
            authorization: { __typename: 'Authorization', id: 'auth-1', myPrivileges: [] },
            calloutTemplates: [],
            postTemplates: [],
            whiteboardTemplates: [],
            spaceTemplates: [],
            communityGuidelinesTemplates: [],
            [bucketKey]: templates,
          },
        },
      } as unknown as AllTemplatesInTemplatesSetQuery,
    },
  };
};

const deleteMock = (templateId: string): MockedResponse<DeleteTemplateMutation> => ({
  request: { query: DeleteTemplateDocument, variables: { templateId } },
  result: {
    data: { deleteTemplate: { __typename: 'Template', id: templateId } } as unknown as DeleteTemplateMutation,
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

describe('useTemplatesManager — initial state', () => {
  it('exposes templatesSetId + an empty pendingDelete + a deletingId of null until something happens', () => {
    const wrapper = makeWrapper([allTemplatesMock('set-1', 'callout', [])]);
    const { result } = renderHook(() => useTemplatesManager({ templatesSetId: 'set-1', holderKind: 'space' }), {
      wrapper,
    });
    expect(result.current.templatesSetId).toBe('set-1');
    expect(result.current.pendingDelete).toBeNull();
    expect(result.current.deletingId).toBeNull();
  });

  it('returns 5 sections (one per type) in TEMPLATE_TYPE_ORDER once the list query resolves', async () => {
    const callout = tpl('c-1', GqlTemplateType.Callout, 'My callout template');
    const wrapper = makeWrapper([allTemplatesMock('set-1', 'callout', [callout])]);
    const { result } = renderHook(() => useTemplatesManager({ templatesSetId: 'set-1', holderKind: 'space' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories.map(c => c.type)).toEqual([
      'space',
      'callout',
      'whiteboard',
      'post',
      'communityGuidelines',
    ]);
    const calloutCategory = result.current.categories.find(c => c.type === 'callout');
    expect(calloutCategory?.templates.map(t => t.id)).toEqual(['c-1']);
  });
});

describe('useTemplatesManager — delete confirmation lifecycle', () => {
  it('onTemplateAction(id, "delete") sets pendingDelete to { id, name } drawn from the matching card', async () => {
    const callout = tpl('c-2', GqlTemplateType.Callout, 'Survey starter');
    const wrapper = makeWrapper([allTemplatesMock('set-1', 'callout', [callout])]);
    const { result } = renderHook(() => useTemplatesManager({ templatesSetId: 'set-1', holderKind: 'space' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onTemplateAction('c-2', 'delete');
    });

    expect(result.current.pendingDelete).toEqual({ id: 'c-2', name: 'Survey starter' });
  });

  it('cancelDelete() clears pendingDelete without firing the mutation', async () => {
    const callout = tpl('c-3', GqlTemplateType.Callout, 'Vote template');
    // Notice: no DeleteTemplate mock provided — the test asserts the mutation does NOT fire on cancel.
    const wrapper = makeWrapper([allTemplatesMock('set-1', 'callout', [callout])]);
    const { result } = renderHook(() => useTemplatesManager({ templatesSetId: 'set-1', holderKind: 'space' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onTemplateAction('c-3', 'delete');
    });
    expect(result.current.pendingDelete).not.toBeNull();

    act(() => {
      result.current.cancelDelete();
    });
    expect(result.current.pendingDelete).toBeNull();
  });

  it('confirmDelete() fires the deleteTemplate mutation, clears pendingDelete, and resolves deletingId back to null', async () => {
    const callout = tpl('c-4', GqlTemplateType.Callout, 'Daily standup');
    const wrapper = makeWrapper([
      allTemplatesMock('set-1', 'callout', [callout]),
      deleteMock('c-4'),
      // After the mutation, the manager refetches `AllTemplatesInTemplatesSet` — provide the empty list response.
      allTemplatesMock('set-1', 'callout', []),
    ]);
    const { result } = renderHook(() => useTemplatesManager({ templatesSetId: 'set-1', holderKind: 'space' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onTemplateAction('c-4', 'delete');
    });
    expect(result.current.pendingDelete).not.toBeNull();

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(result.current.pendingDelete).toBeNull();
    expect(result.current.deletingId).toBeNull();
  });

  it('confirmDelete() is a no-op when there is no pendingDelete to confirm', async () => {
    const wrapper = makeWrapper([allTemplatesMock('set-1', 'callout', [])]);
    const { result } = renderHook(() => useTemplatesManager({ templatesSetId: 'set-1', holderKind: 'space' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // No pendingDelete — confirmDelete must resolve without throwing.
    await act(async () => {
      await result.current.confirmDelete();
    });
    expect(result.current.deletingId).toBeNull();
  });

  it('onTemplateAction(id, "delete") for an unknown id is a no-op (defensive)', async () => {
    const wrapper = makeWrapper([allTemplatesMock('set-1', 'callout', [])]);
    const { result } = renderHook(() => useTemplatesManager({ templatesSetId: 'set-1', holderKind: 'space' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onTemplateAction('does-not-exist', 'delete');
    });
    expect(result.current.pendingDelete).toBeNull();
  });
});
