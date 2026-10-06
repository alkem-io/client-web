import { ApolloError } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { describe, expect, test, vi } from 'vitest';
import {
  UrlResolverResultState,
  UrlType,
  VirtualContributorBodyOfKnowledgeType,
} from '@/core/apollo/generated/graphql-schema';
import useVcConversion from './useVcConversion';

const mockNotify = vi.fn();

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => mockNotify,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockHandleApolloError = vi.fn();

vi.mock('@/core/apollo/hooks/useApolloErrorHandler', () => ({
  useApolloErrorHandler: () => mockHandleApolloError,
}));

const mockConvertMutation = vi.fn().mockResolvedValue({ data: {} });

let mockResolveData: Record<string, unknown> | undefined;
let mockVcData: Record<string, unknown> | undefined;
let mockSpaceData: Record<string, unknown> | undefined;

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useVcConversionUrlResolveQuery: () => ({
    data: mockResolveData,
    loading: false,
  }),
  useVcConversionLookupQuery: () => ({
    data: mockVcData,
    loading: false,
  }),
  useVcConversionSourceSpaceCalloutsQuery: () => ({
    data: mockSpaceData,
    loading: false,
  }),
  useConvertVcToKnowledgeBaseMutation: () => [mockConvertMutation, { loading: false }],
}));

describe('useVcConversion', () => {
  test('returns no error in initial state', () => {
    mockResolveData = undefined;
    mockVcData = undefined;
    mockSpaceData = undefined;
    const { result } = renderHook(() => useVcConversion());
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSpaceBased).toBe(false);
    expect(result.current.isAlreadyConverted).toBe(false);
  });

  test('returns urlNotFound when resolver reports NotFound', () => {
    mockResolveData = {
      urlResolver: {
        state: UrlResolverResultState.NotFound,
        type: null,
        virtualContributor: null,
      },
    };
    const { result } = renderHook(() => useVcConversion());
    expect(result.current.error).toBe('pages.admin.vcConversion.urlNotFound');
  });

  test('returns urlNotVc when resolved entity is not a VC', () => {
    mockResolveData = {
      urlResolver: {
        state: UrlResolverResultState.Resolved,
        type: UrlType.User,
        virtualContributor: null,
      },
    };
    const { result } = renderHook(() => useVcConversion());
    expect(result.current.error).toBe('pages.admin.vcConversion.urlNotVc');
  });

  test('ALKEMIO_SPACE VC is convertible and fetches source space callouts', () => {
    mockResolveData = {
      urlResolver: {
        state: UrlResolverResultState.Resolved,
        type: UrlType.VirtualContributor,
        virtualContributor: { id: 'vc-1' },
      },
    };
    mockVcData = {
      lookup: {
        virtualContributor: {
          id: 'vc-1',
          profile: { displayName: 'Space VC', url: '/vc' },
          bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.AlkemioSpace,
          bodyOfKnowledgeID: 'source-space-1',
          account: { id: 'acc-1', host: { profile: { displayName: 'Owner' } } },
          authorization: { myPrivileges: [] },
        },
      },
    };
    mockSpaceData = {
      lookup: {
        space: {
          id: 'source-space-1',
          about: { profile: { displayName: 'Source Space' } },
          collaboration: {
            calloutsSet: {
              callouts: [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }],
            },
          },
        },
      },
    };
    const { result } = renderHook(() => useVcConversion());
    expect(result.current.isSpaceBased).toBe(true);
    expect(result.current.isAlreadyConverted).toBe(false);
    expect(result.current.sourceSpaceName).toBe('Source Space');
    expect(result.current.calloutCount).toBe(3);
  });

  test('ALKEMIO_KNOWLEDGE_BASE VC is already converted — conversion disabled', () => {
    mockResolveData = {
      urlResolver: {
        state: UrlResolverResultState.Resolved,
        type: UrlType.VirtualContributor,
        virtualContributor: { id: 'vc-2' },
      },
    };
    mockVcData = {
      lookup: {
        virtualContributor: {
          id: 'vc-2',
          profile: { displayName: 'KB VC', url: '/vc2' },
          bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.AlkemioKnowledgeBase,
          bodyOfKnowledgeID: null,
          account: { id: 'acc-1', host: { profile: { displayName: 'Owner' } } },
          authorization: { myPrivileges: [] },
        },
      },
    };
    mockSpaceData = undefined;
    const { result } = renderHook(() => useVcConversion());
    expect(result.current.isSpaceBased).toBe(false);
    expect(result.current.isAlreadyConverted).toBe(true);
    expect(result.current.sourceSpaceName).toBeUndefined();
    expect(result.current.calloutCount).toBe(0);
  });

  test('source space callout query is skipped for non-space-based VCs', () => {
    mockResolveData = {
      urlResolver: {
        state: UrlResolverResultState.Resolved,
        type: UrlType.VirtualContributor,
        virtualContributor: { id: 'vc-3' },
      },
    };
    mockVcData = {
      lookup: {
        virtualContributor: {
          id: 'vc-3',
          profile: { displayName: 'Other VC', url: '/vc3' },
          bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.Other,
          bodyOfKnowledgeID: null,
          account: { id: 'acc-1', host: { profile: { displayName: 'Owner' } } },
          authorization: { myPrivileges: [] },
        },
      },
    };
    mockSpaceData = undefined;
    const { result } = renderHook(() => useVcConversion());
    expect(result.current.isSpaceBased).toBe(false);
    expect(result.current.isAlreadyConverted).toBe(false);
    expect(result.current.calloutCount).toBe(0);
  });

  test('a space holding a Form is rejected with its own translated reason, not the generic error', async () => {
    mockResolveData = {
      urlResolver: {
        state: UrlResolverResultState.Resolved,
        type: UrlType.VirtualContributor,
        virtualContributor: { id: 'vc-1' },
      },
    };
    mockVcData = {
      lookup: {
        virtualContributor: {
          id: 'vc-1',
          profile: { displayName: 'Space VC', url: '/vc' },
          bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.AlkemioSpace,
          bodyOfKnowledgeID: 'source-space-1',
          account: { id: 'acc-1', host: { profile: { displayName: 'Owner' } } },
          authorization: { myPrivileges: [] },
        },
      },
    };
    mockSpaceData = undefined;
    mockNotify.mockClear();
    mockHandleApolloError.mockClear();
    mockConvertMutation.mockRejectedValueOnce(
      new ApolloError({
        graphQLErrors: [
          new GraphQLError('A space with a Form callout cannot be converted', {
            extensions: { code: 'BAD_USER_INPUT', details: { code: 'FORM_TRANSFER_NOT_ALLOWED' } },
          }),
        ],
      })
    );
    const { result } = renderHook(() => useVcConversion());

    await act(() => result.current.handleConvert());

    expect(mockConvertMutation).toHaveBeenLastCalledWith(
      expect.objectContaining({ context: { skipGlobalErrorHandler: true } })
    );
    expect(mockNotify).toHaveBeenCalledTimes(1);
    expect(mockNotify).toHaveBeenCalledWith('pages.admin.vcConversion.formNotAllowed', 'error');
    expect(mockHandleApolloError).not.toHaveBeenCalled();
  });
});
