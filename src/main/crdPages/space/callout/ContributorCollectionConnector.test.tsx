import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { enUS, nl } from 'date-fns/locale';
import i18next from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import spaceEnJson from '@/crd/i18n/space/space.en.json';

const mockNavigate = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({ default: () => mockNavigate }));

// A mutable box so each test can flip the resolved date-fns locale without
// re-mocking the module — the connector reads it fresh on every render.
let mockLocale = enUS;
vi.mock('@/main/crdPages/space/hooks/useCrdSpaceLocale', () => ({
  useCrdSpaceLocale: () => mockLocale,
}));

// One card whose only new value is the raw joinedDate — proves the connector
// decorates at render (joinedMonthLabel), never stores a formatted string.
const userCard = {
  id: 'user-ada',
  type: 'user' as const,
  name: 'Ada',
  hasValidCoordinates: false,
  joinedDate: '2023-10-01T00:00:00.000Z',
};
const otherUserCard = {
  id: 'user-ben',
  type: 'user' as const,
  name: 'Ben',
  hasValidCoordinates: false,
  href: 'https://alkemio.test/ben',
};
const vcCard = {
  id: 'vc-helper',
  type: 'virtualContributor' as const,
  name: 'Helper VC',
  hasValidCoordinates: false,
  href: 'https://alkemio.test/helper-vc',
};
const orgCard = {
  id: 'org-green',
  type: 'organization' as const,
  name: 'Green Future Labs',
  hasValidCoordinates: false,
  href: 'https://alkemio.test/green-future-labs',
};

let mockCards: unknown[] = [userCard];
const mockGetCards = vi.fn(() => mockCards);
vi.mock('@/main/crdPages/space/hooks/useCrdSpaceContributors', () => ({
  useCrdSpaceContributors: () => ({
    types: ['user'],
    defaultType: 'user',
    defaultView: 'list',
    fixedView: null,
    counts: { users: mockCards.length, organizations: 0, virtualContributors: 0 },
    getCards: mockGetCards,
    ensureLoaded: vi.fn(),
    isLoading: () => false,
    loading: false,
    isCustomSelection: false,
  }),
}));

let mockSignedIn = true;
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({
    isEnabled: mockSignedIn,
    setIsOpen: mockSetIsOpen,
    setSelectedConversationId: mockSetSelectedConversationId,
    setSelectedRoomId: mockSetSelectedRoomId,
    setNewlyCreatedConversationId: mockSetNewlyCreatedConversationId,
  }),
}));
const mockSetIsOpen = vi.fn();
const mockSetSelectedConversationId = vi.fn();
const mockSetSelectedRoomId = vi.fn();
const mockSetNewlyCreatedConversationId = vi.fn();

let mockCurrentUserId: string | undefined = 'user-current-viewer';
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: mockCurrentUserId ? { id: mockCurrentUserId } : undefined }),
}));

const mockCreateConversation = vi.fn();
const mockSendMessageToOrganization = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateConversationMutation: () => [mockCreateConversation],
  useSendMessageToOrganizationMutation: () => [mockSendMessageToOrganization],
}));

const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

import { ContributorCollectionConnector } from './ContributorCollectionConnector';

const i18n = i18next.createInstance();

beforeEach(async () => {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng: 'en',
      fallbackLng: 'en',
      ns: ['crd-space', 'crd-profilePages'],
      defaultNS: 'crd-space',
      resources: {
        en: {
          'crd-space': spaceEnJson,
          'crd-profilePages': {
            common: {
              messagePopover: {
                cannotBeReached: 'This person cannot be contacted.',
                openChatError: "We couldn't open the chat. Please try again.",
                ariaLabel: 'Compose message',
                cancel: 'Cancel',
                send: 'Send',
                sending: 'Sending…',
                errorTitle: 'Could not send your message',
              },
            },
            orgProfile: {
              hero: {
                messageEmailTitle: 'Send an email',
                messageEmailNotice: "Delivered to the organisation's administrators.",
                messageEmailPlaceholder: 'Write an email…',
              },
            },
          },
        },
      },
      interpolation: { escapeValue: false },
    });
  }

  mockLocale = enUS;
  mockCards = [userCard];
  mockSignedIn = true;
  mockCurrentUserId = 'user-current-viewer';
  mockCreateConversation.mockReset();
  mockSendMessageToOrganization.mockReset();
  mockToastError.mockReset();
  mockToastSuccess.mockReset();
  mockSetIsOpen.mockReset();
  mockSetSelectedConversationId.mockReset();
  mockSetSelectedRoomId.mockReset();
  mockSetNewlyCreatedConversationId.mockReset();
});

const renderConnector = (ui: ReactElement) => render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

describe('ContributorCollectionConnector — join-month decoration at render (US4, isolated block)', () => {
  test('renders "Joined this space Oct 2023" for a user with a joinedDate', () => {
    renderConnector(<ContributorCollectionConnector calloutId="callout-1" />);

    expect(screen.getByText('Joined this space Oct 2023')).toBeInTheDocument();
  });

  test('a live language switch re-labels the card without a new fetch', () => {
    const { rerender } = renderConnector(<ContributorCollectionConnector calloutId="callout-1" />);
    expect(screen.getByText('Joined this space Oct 2023')).toBeInTheDocument();

    // Only the resolved date-fns locale changes — the underlying card model
    // (and its raw joinedDate) is untouched, exactly as it would be after a
    // language switch with no refetch of the contributor list.
    mockLocale = nl;
    rerender(
      <I18nextProvider i18n={i18n}>
        <ContributorCollectionConnector calloutId="callout-1" />
      </I18nextProvider>
    );

    // The month abbreviation is now Dutch — proving the label is re-derived
    // at render from the same underlying model, not cached from first render.
    expect(screen.getByText(/Joined this space okt/i)).toBeInTheDocument();
  });
});

describe('ContributorCollectionConnector — canMessage wiring (US3, D-AUTH/D-CONTACT)', () => {
  test('signed out: every card has canMessage false (no menu Message item)', async () => {
    mockSignedIn = false;
    mockCards = [otherUserCard];
    renderConnector(<ContributorCollectionConnector calloutId="callout-1" />);

    await userEvent.click(screen.getByRole('button', { name: /Actions for Ben/ }));
    expect(screen.queryByRole('menuitem', { name: 'Message' })).not.toBeInTheDocument();
  });

  test("the viewer's own card never offers Message", async () => {
    mockCurrentUserId = otherUserCard.id;
    mockCards = [otherUserCard];
    renderConnector(<ContributorCollectionConnector calloutId="callout-1" />);

    await userEvent.click(screen.getByRole('button', { name: /Actions for Ben/ }));
    expect(screen.queryByRole('menuitem', { name: 'Message' })).not.toBeInTheDocument();
  });

  test('a virtual contributor never offers Message', async () => {
    mockCards = [vcCard];
    renderConnector(<ContributorCollectionConnector calloutId="callout-1" />);

    await userEvent.click(screen.getByRole('button', { name: /Actions for Helper VC/ }));
    expect(screen.queryByRole('menuitem', { name: 'Message' })).not.toBeInTheDocument();
  });

  test('another signed-in user offers Message', async () => {
    mockCards = [otherUserCard];
    renderConnector(<ContributorCollectionConnector calloutId="callout-1" />);

    await userEvent.click(screen.getByRole('button', { name: /Actions for Ben/ }));
    expect(screen.getByRole('menuitem', { name: 'Message' })).toBeInTheDocument();
  });
});

describe('ContributorCollectionConnector — Message wiring (US3)', () => {
  test("Message on a user calls the create-conversation mutation with that user's id", async () => {
    mockCreateConversation.mockResolvedValue({
      data: {
        createConversation: {
          id: 'conv-1',
          room: {
            id: 'room-1',
            type: 'DIRECT',
            createdDate: new Date().toISOString(),
            unreadCount: 0,
            messagesCount: 0,
          },
        },
      },
    });
    mockCards = [otherUserCard];
    renderConnector(<ContributorCollectionConnector calloutId="callout-1" />);

    await userEvent.click(screen.getByRole('button', { name: /Actions for Ben/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Message' }));

    expect(mockCreateConversation).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { conversationData: { memberIDs: ['user-ben'], type: 'DIRECT' } } })
    );
  });

  test('a MESSAGING_NOT_ENABLED error shows the cannot-be-contacted text and never opens the panel', async () => {
    const { ApolloError } = await import('@apollo/client');
    mockCreateConversation.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [{ message: 'refused', extensions: { code: 'MESSAGING_NOT_ENABLED' } } as never],
      })
    );
    mockCards = [otherUserCard];
    renderConnector(<ContributorCollectionConnector calloutId="callout-1" />);

    await userEvent.click(screen.getByRole('button', { name: /Actions for Ben/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Message' }));

    expect(mockToastError).toHaveBeenCalledWith('This person cannot be contacted.');
    expect(mockSetIsOpen).not.toHaveBeenCalledWith(true);
  });

  test('Message on an organization opens a dialog titled "Send an email" and sending calls sendMessageToOrganization', async () => {
    mockSendMessageToOrganization.mockResolvedValue({ data: { sendMessageToOrganization: true } });
    mockCards = [orgCard];
    renderConnector(<ContributorCollectionConnector calloutId="callout-1" />);

    await userEvent.click(screen.getByRole('button', { name: /Actions for Green Future Labs/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Message' }));

    expect(screen.getByRole('heading', { name: 'Send an email' })).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Compose message'), 'Hello there');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(mockSendMessageToOrganization).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { messageData: { message: 'Hello there', organizationId: 'org-green' } },
      })
    );
  });
});
