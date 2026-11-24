import { ApolloError } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { afterEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

const startDirectChatMock = vi.fn();
vi.mock('@/main/crdPages/unifiedChat/useStartDirectChat', () => ({
  useStartDirectChat: (userId: string | undefined) => ({
    startDirectChat: (id = userId) => startDirectChatMock(id),
  }),
}));

const sendMessageToUsersMock = vi.fn();
const sendMessageToOrganizationMock = vi.fn();
const mutationOptionsMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSendMessageToUsersMutation: (options: unknown) => {
    mutationOptionsMock('sendMessageToUsers', options);
    return [sendMessageToUsersMock, { loading: false }];
  },
  useSendMessageToOrganizationMutation: (options: unknown) => {
    mutationOptionsMock('sendMessageToOrganization', options);
    return [sendMessageToOrganizationMock, { loading: false }];
  },
}));

vi.mock('react-i18next', async importOriginal => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key, i18n: i18next }),
}));

const toastErrorMock = vi.fn();
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: (...args: unknown[]) => toastErrorMock(...args) } }));

import i18next from 'i18next';
import '@/core/i18n/config';
import commonEN from '@/crd/i18n/common/common.en.json';
import commonNL from '@/crd/i18n/common/common.nl.json';
import {
  useMessageContributor,
  useOpenDirectChatHandler,
  useSendEmailToUserHandler,
  useSendMessageToOrganizationHandler,
} from './useSendMessageHandler';

describe('useOpenDirectChatHandler (US1 — profile Message → open 1:1 chat)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('opens/focuses the direct chat WITHOUT sending a message (FR-001)', async () => {
    startDirectChatMock.mockResolvedValue({ conversationId: 'conv-1', roomId: 'room-1' });

    const { result } = renderHook(() => useOpenDirectChatHandler({ recipientUserId: 'user-2' }));
    await result.current.onOpenChat();

    expect(startDirectChatMock).toHaveBeenCalledWith('user-2');
    expect(sendMessageToUsersMock).not.toHaveBeenCalled();
  });

  test('reuses an existing conversation (dedup) — startDirectChat is the single seam', async () => {
    // startDirectChat dedups server-side; the handler always routes through it
    // and opens/focuses whatever conversation it returns (existing or new).
    startDirectChatMock.mockResolvedValue({ conversationId: 'existing-conv', roomId: 'existing-room' });

    const { result } = renderHook(() => useOpenDirectChatHandler({ recipientUserId: 'user-2' }));
    await result.current.onOpenChat();

    expect(startDirectChatMock).toHaveBeenCalledTimes(1);
  });

  test('surfaces an error toast when the chat cannot be opened', async () => {
    startDirectChatMock.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useOpenDirectChatHandler({ recipientUserId: 'user-2' }));
    await result.current.onOpenChat();

    expect(toastErrorMock).toHaveBeenCalledWith('common.messagePopover.openChatError');
  });

  test('opens the chat with a call-time recipient when the hook has none', async () => {
    startDirectChatMock.mockResolvedValue({ conversationId: 'conv-9', roomId: 'room-9' });

    const { result } = renderHook(() => useOpenDirectChatHandler({ recipientUserId: undefined }));
    await result.current.onOpenChat('user-9');

    expect(startDirectChatMock).toHaveBeenCalledWith('user-9');
  });

  test('a MESSAGING_NOT_ENABLED refusal shows exactly one cannotBeReached toast', async () => {
    startDirectChatMock.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [new GraphQLError('not enabled', { extensions: { code: 'MESSAGING_NOT_ENABLED' } })],
      })
    );

    const { result } = renderHook(() => useOpenDirectChatHandler({ recipientUserId: 'user-2' }));
    await result.current.onOpenChat();

    expect(toastErrorMock).toHaveBeenCalledTimes(1);
    expect(toastErrorMock).toHaveBeenCalledWith('common.messagePopover.cannotBeReached');
  });

  test('throws when no recipient is loaded', async () => {
    const { result } = renderHook(() => useOpenDirectChatHandler({ recipientUserId: undefined }));
    await expect(result.current.onOpenChat()).rejects.toThrow('Recipient user not loaded.');
    expect(startDirectChatMock).not.toHaveBeenCalled();
  });
});

describe('useMessageContributor (hover card Message action)', () => {
  afterEach(() => vi.clearAllMocks());

  test('opens a direct chat with the clicked contributor', async () => {
    startDirectChatMock.mockResolvedValue({ conversationId: 'conv-3', roomId: 'room-3' });

    const { result } = renderHook(() => useMessageContributor());
    result.current({ id: 'user-3' });

    await vi.waitFor(() => expect(startDirectChatMock).toHaveBeenCalledWith('user-3'));
  });
});

describe('useSendMessageToOrganizationHandler — hourly message allowance used up', () => {
  const limitError = () =>
    new ApolloError({
      graphQLErrors: [new GraphQLError('refused', { extensions: { code: 'MESSAGE_SEND_LIMIT_REACHED' } })],
    });

  afterEach(async () => {
    vi.clearAllMocks();
    await i18next.changeLanguage('en');
  });

  test('sends without the global error handler', async () => {
    sendMessageToOrganizationMock.mockResolvedValue({ data: { sendMessageToOrganization: true } });

    const { result } = renderHook(() => useSendMessageToOrganizationHandler({ recipientOrganizationId: 'org-1' }));
    await result.current.onSendMessage('hello');

    expect(sendMessageToOrganizationMock).toHaveBeenCalledWith(
      expect.objectContaining({ context: { skipGlobalErrorHandler: true } })
    );
  });

  test('rejects with an Error whose message is the limit text', async () => {
    sendMessageToOrganizationMock.mockRejectedValue(limitError());

    const { result } = renderHook(() => useSendMessageToOrganizationHandler({ recipientOrganizationId: 'org-1' }));
    const rejection = result.current.onSendMessage('hello');

    await expect(rejection).rejects.toBeInstanceOf(Error);
    await expect(rejection).rejects.toThrow(commonEN.apollo.errors.userMessages.operations.messageSendLimitReached);
  });

  test('the limit text follows the active language', async () => {
    await i18next.changeLanguage('nl');
    sendMessageToOrganizationMock.mockRejectedValue(limitError());

    const { result } = renderHook(() => useSendMessageToOrganizationHandler({ recipientOrganizationId: 'org-1' }));

    await expect(result.current.onSendMessage('hello')).rejects.toThrow(
      commonNL.apollo.errors.userMessages.operations.messageSendLimitReached
    );
  });

  test("any other refusal rejects with the server's reason", async () => {
    sendMessageToOrganizationMock.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [
          new GraphQLError('Organization does not accept messages', {
            extensions: { code: 'OPERATION_NOT_ALLOWED', userMessage: 'userMessages.operations.operationNotAllowed' },
          }),
        ],
      })
    );

    const { result } = renderHook(() => useSendMessageToOrganizationHandler({ recipientOrganizationId: 'org-1' }));

    await expect(result.current.onSendMessage('hello')).rejects.toThrow(
      'apollo.errors.userMessages.operations.operationNotAllowed Organization does not accept messages'
    );
  });

  test('a failure with no server reply rejects with the generic send failure', async () => {
    sendMessageToOrganizationMock.mockRejectedValue(new ApolloError({ networkError: new Error('Failed to fetch') }));

    const { result } = renderHook(() => useSendMessageToOrganizationHandler({ recipientOrganizationId: 'org-1' }));

    await expect(result.current.onSendMessage('hello')).rejects.toThrow('common.messagePopover.errorTitle');
  });
});

describe('useSendEmailToUserHandler', () => {
  afterEach(() => vi.clearAllMocks());

  test('leaves a refused send to the compose surface, which shows it inline', () => {
    renderHook(() => useSendEmailToUserHandler({ recipientUserId: 'user-1' }));

    expect(mutationOptionsMock).toHaveBeenCalledWith('sendMessageToUsers', {
      context: { skipGlobalErrorHandler: true },
    });
  });
});
