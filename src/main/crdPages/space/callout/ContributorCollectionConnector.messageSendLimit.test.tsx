import { ApolloError } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { enUS } from 'date-fns/locale';
import { GraphQLError } from 'graphql';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import '@/core/i18n/config';
import commonEN from '@/crd/i18n/common/common.en.json';
import spaceEnJson from '@/crd/i18n/space/space.en.json';

const limitText = commonEN.apollo.errors.userMessages.operations.messageSendLimitReached;

vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));
vi.mock('@/main/crdPages/space/hooks/useCrdSpaceLocale', () => ({ useCrdSpaceLocale: () => enUS }));

const orgCard = {
  id: 'org-green',
  type: 'organization' as const,
  name: 'Green Future Labs',
  hasValidCoordinates: false,
  href: 'https://alkemio.test/green-future-labs',
};

vi.mock('@/main/crdPages/space/hooks/useCrdSpaceContributors', () => ({
  useCrdSpaceContributors: () => ({
    types: ['organization'],
    defaultType: 'organization',
    defaultView: 'list',
    fixedView: null,
    counts: { users: 0, organizations: 1, virtualContributors: 0 },
    getCards: () => [orgCard],
    ensureLoaded: vi.fn(),
    isLoading: () => false,
    loading: false,
    isCustomSelection: false,
  }),
}));

vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({
    isEnabled: true,
    setIsOpen: vi.fn(),
    setSelectedConversationId: vi.fn(),
    setSelectedRoomId: vi.fn(),
    setNewlyCreatedConversationId: vi.fn(),
  }),
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'user-current-viewer' } }),
}));

const sendMessageToOrganizationMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateConversationMutation: () => [vi.fn()],
  useSendMessageToOrganizationMutation: () => [sendMessageToOrganizationMock],
}));

const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
    success: (...args: unknown[]) => toastSuccessMock(...args),
  },
}));

import { ContributorCollectionConnector } from './ContributorCollectionConnector';

// The collection's own labels: English for the space namespace, keys for the composer.
const pageI18n = i18next.createInstance();

beforeAll(async () => {
  await pageI18n.use(initReactI18next).init({
    lng: 'en',
    ns: ['crd-space', 'crd-profilePages'],
    defaultNS: 'crd-space',
    resources: { en: { 'crd-space': spaceEnJson } },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
});

beforeEach(() => {
  vi.clearAllMocks();
});

const sendToOrganization = async () => {
  render(
    <I18nextProvider i18n={pageI18n}>
      <ContributorCollectionConnector calloutId="callout-1" />
    </I18nextProvider>
  );
  await userEvent.click(screen.getByRole('button', { name: /Actions for Green Future Labs/ }));
  await userEvent.click(screen.getByRole('menuitem', { name: 'Message' }));
  await userEvent.type(screen.getByRole('textbox', { name: 'common.messagePopover.ariaLabel' }), 'Hello there');
  await userEvent.click(screen.getByRole('button', { name: 'common.messagePopover.send' }));
};

describe('ContributorCollectionConnector — message to an organisation when the hourly allowance is used up', () => {
  test('shows the limit text once in the composer and raises no notification', async () => {
    sendMessageToOrganizationMock.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [new GraphQLError('refused', { extensions: { code: 'MESSAGE_SEND_LIMIT_REACHED' } })],
      })
    );

    await sendToOrganization();

    expect(await screen.findAllByText(limitText)).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: 'common.messagePopover.ariaLabel' })).toHaveValue('Hello there');
    expect(toastErrorMock).not.toHaveBeenCalled();
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });

  test('another failure shows what the composer showed before, not the limit text', async () => {
    sendMessageToOrganizationMock.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [new GraphQLError('Something failed', { extensions: { code: 'UNSPECIFIED' } })],
      })
    );

    await sendToOrganization();

    expect(await screen.findByText('Something failed')).toBeInTheDocument();
    expect(screen.queryByText(limitText)).not.toBeInTheDocument();
  });
});
