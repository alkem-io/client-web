/**
 * @vitest-environment jsdom
 *
 * `useClassificationPicker` — Step A picker sources (024-classifications, qual-cw-2). Covers the
 * open-gated fetch (both source queries are skipped until the picker opens), the mapping into
 * `ClassificationPickerSource[]`, and — the one this hook can actually promise, since resolving
 * *which* id is level-zero is the caller's job (see the `useSpace()` contract documented at
 * `CrdSpaceSettingsPage.tsx`) — that whatever `levelZeroSpaceId` it is given is exactly the id the
 * Space-scoped query is sent with, unsubstituted.
 */
import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { FC, PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import {
  ClassificationTemplatesForSpaceDocument,
  ClassificationTemplatesPlatformWideDocument,
} from '@/core/apollo/generated/apollo-hooks';
import type {
  ClassificationTemplatesForSpaceQuery,
  ClassificationTemplatesPlatformWideQuery,
} from '@/core/apollo/generated/graphql-schema';
import { useClassificationPicker } from './useClassificationPicker';

const template = (id: string, displayName: string) => ({
  __typename: 'Template' as const,
  id,
  profile: { __typename: 'Profile' as const, id: `${id}-profile`, displayName, description: '' },
  classification: {
    __typename: 'ClassificationTemplateContent' as const,
    cardinality: 'MULTI_SELECT',
    values: [],
  },
});

const platformMock = (
  templates: ReturnType<typeof template>[]
): MockedResponse<ClassificationTemplatesPlatformWideQuery> => ({
  request: { query: ClassificationTemplatesPlatformWideDocument },
  result: {
    data: {
      platform: {
        __typename: 'Platform',
        library: {
          __typename: 'Library',
          templates: templates.map(t => ({ __typename: 'TemplateResult', template: t })),
        },
      },
    } as unknown as ClassificationTemplatesPlatformWideQuery,
  },
});

const spaceScopedMock = (
  levelZeroSpaceId: string,
  templates: ReturnType<typeof template>[]
): MockedResponse<ClassificationTemplatesForSpaceQuery> => ({
  request: { query: ClassificationTemplatesForSpaceDocument, variables: { levelZeroSpaceId } },
  result: {
    data: {
      lookup: {
        __typename: 'LookupQueryResults',
        space: {
          __typename: 'Space',
          id: levelZeroSpaceId,
          templatesManager: {
            __typename: 'TemplatesManager',
            templatesSet: { __typename: 'TemplatesSet', id: 'set-1', classificationTemplates: templates },
          },
        },
      },
    } as unknown as ClassificationTemplatesForSpaceQuery,
  },
});

const makeWrapper = (mocks: MockedResponse[]): FC<PropsWithChildren> => {
  return ({ children }) => (
    <MockedProvider mocks={mocks} cache={new InMemoryCache()}>
      {children}
    </MockedProvider>
  );
};

describe('useClassificationPicker', () => {
  it('starts closed and fetches neither source until openPicker() is called', () => {
    // No mocks provided at all — if either query fired before open, MockedProvider would
    // reject it as unmatched and this test would fail with a console error.
    const wrapper = makeWrapper([]);
    const { result } = renderHook(() => useClassificationPicker('root-space-1'), { wrapper });

    expect(result.current.open).toBe(false);
    expect(result.current.sources).toEqual([
      { key: 'platform', templates: [], loading: false },
      { key: 'space', templates: [], loading: false },
    ]);
  });

  it('on open, queries the Space-scoped half with EXACTLY the levelZeroSpaceId it was given (US1-AS7)', async () => {
    const platformTpl = template('tpl-sdgs', 'SDGs');
    const spaceTpl = template('tpl-sector', 'Sector');
    // If the hook substituted a different id (e.g. the current route's own space id instead of
    // the level-zero one passed in), MockedProvider would find no matching mock for this exact
    // variable and the space source would hang loading forever instead of resolving.
    const wrapper = makeWrapper([platformMock([platformTpl]), spaceScopedMock('root-space-1', [spaceTpl])]);
    const { result } = renderHook(() => useClassificationPicker('root-space-1'), { wrapper });

    act(() => result.current.openPicker());
    expect(result.current.open).toBe(true);

    await waitFor(() => expect(result.current.sources.every(s => !s.loading)).toBe(true));

    const platformSource = result.current.sources.find(s => s.key === 'platform');
    const spaceSource = result.current.sources.find(s => s.key === 'space');
    expect(platformSource?.templates).toEqual([
      { id: 'tpl-sdgs', displayLabel: 'SDGs', description: '', cardinality: 'MULTI_SELECT', values: [] },
    ]);
    expect(spaceSource?.templates).toEqual([
      { id: 'tpl-sector', displayLabel: 'Sector', description: '', cardinality: 'MULTI_SELECT', values: [] },
    ]);
  });

  it('closePicker() flips open back to false', async () => {
    const wrapper = makeWrapper([platformMock([]), spaceScopedMock('root-space-1', [])]);
    const { result } = renderHook(() => useClassificationPicker('root-space-1'), { wrapper });

    act(() => result.current.openPicker());
    expect(result.current.open).toBe(true);
    await waitFor(() => expect(result.current.sources.every(s => !s.loading)).toBe(true));

    act(() => result.current.closePicker());
    expect(result.current.open).toBe(false);
  });
});
