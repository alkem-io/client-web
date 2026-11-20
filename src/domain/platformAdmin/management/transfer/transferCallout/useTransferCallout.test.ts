import { ApolloError } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege, UrlResolverResultState } from '@/core/apollo/generated/graphql-schema';
import useTransferCallout from './useTransferCallout';

const mockNotify = vi.fn();
const mockHandleApolloError = vi.fn();
const mockTransfer = vi.fn();

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => mockNotify }));
vi.mock('@/core/apollo/hooks/useApolloErrorHandler', () => ({
  useApolloErrorHandler: () => mockHandleApolloError,
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutUrlResolveQuery: () => ({
    data: {
      urlResolver: {
        state: UrlResolverResultState.Resolved,
        space: { collaboration: { calloutsSet: { id: 'source-set', calloutId: 'callout-1' } } },
      },
    },
    loading: false,
  }),
  useCalloutLookupQuery: () => ({
    data: {
      lookup: {
        callout: { id: 'callout-1' },
        calloutsSet: { authorization: { myPrivileges: [AuthorizationPrivilege.TransferResourceOffer] } },
      },
    },
    loading: false,
  }),
  useSpaceUrlResolveQuery: () => ({
    data: { urlResolver: { state: UrlResolverResultState.Resolved, space: { id: 'space-2' } } },
    loading: false,
  }),
  useSpaceCalloutsSetLookupQuery: () => ({
    data: {
      lookup: {
        space: {
          collaboration: {
            calloutsSet: {
              id: 'target-set',
              authorization: { myPrivileges: [AuthorizationPrivilege.TransferResourceAccept] },
            },
          },
        },
      },
    },
    loading: false,
  }),
  useTransferCalloutMutation: () => [mockTransfer, { loading: false }],
}));

const rejectWith = (details: unknown) =>
  new ApolloError({
    graphQLErrors: [new GraphQLError('rejected', { extensions: { code: 'BAD_USER_INPUT', details } })],
  });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useTransferCallout', () => {
  test('a Form rejection shows its own translated reason instead of the generic error', async () => {
    mockTransfer.mockRejectedValue(rejectWith({ code: 'FORM_TRANSFER_NOT_ALLOWED' }));
    const { result } = renderHook(() => useTransferCallout());

    await act(() => result.current.handleTransfer());

    expect(mockTransfer).toHaveBeenCalledWith({
      variables: { calloutId: 'callout-1', targetCalloutsSetId: 'target-set' },
      context: { skipGlobalErrorHandler: true },
    });
    expect(mockNotify).toHaveBeenCalledWith('pages.admin.transferCallout.formNotAllowed', 'error');
    expect(mockHandleApolloError).not.toHaveBeenCalled();
    // Nothing moved: the source and target stay selected.
    expect(result.current.callout).toEqual({ id: 'callout-1' });
  });

  test('any other rejection still goes through the global Apollo error handler', async () => {
    const error = rejectWith(undefined);
    mockTransfer.mockRejectedValue(error);
    const { result } = renderHook(() => useTransferCallout());

    await act(() => result.current.handleTransfer());

    expect(mockHandleApolloError).toHaveBeenCalledWith(error);
    expect(mockNotify).not.toHaveBeenCalled();
  });
});
