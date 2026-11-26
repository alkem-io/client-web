import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { enUS } from 'date-fns/locale';
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

// 021: the contributors arrive in the post's own ContributorsContent (read from the cache, no request).
const actor = (id: string, actorType: string, displayName: string, url?: string) => ({
  __typename: 'User' as const,
  id,
  actorType,
  url,
  about: { displayName },
});
const userCard = actor('user-ada', 'user', 'Ada');
const otherUserCard = actor('00000000-0000-4000-8000-000000000002', 'user', 'Ben', 'https://alkemio.test/ben');
const vcCard = actor('vc-helper', 'virtual_contributor', 'Helper VC', 'https://alkemio.test/helper-vc');
const orgCard = actor('org-green', 'organization', 'Green Future Labs', 'https://alkemio.test/green-future-labs');

let mockCards: ReturnType<typeof actor>[] = [userCard];
vi.mock('@/domain/collaboration/callout/useCalloutDetails/useCalloutDetails', () => ({
  useCachedPost: () => ({
    contentKind: 'contributors',
    content: {
      __typename: 'ContributorsContent',
      settings: { types: ['user', 'organization', 'virtual_contributor'], default_type: mockCards[0]?.actorType },
      counts: [{ type: mockCards[0]?.actorType, count: mockCards.length }],
      contributors: mockCards,
    },
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

const mockCreateRoom = vi.fn();
vi.mock('@/core/matrix/activeClient', () => ({
  useMatrixClient: () => ({
    getUserId: () => '@00000000-0000-4000-8000-000000000001:matrix.test',
    getAccountData: () => undefined,
    createRoom: mockCreateRoom,
  }),
}));
const mockSendMessageToOrganization = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
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
  mockCreateRoom.mockReset();
  mockSendMessageToOrganization.mockReset();
  mockToastError.mockReset();
  mockToastSuccess.mockReset();
  mockSetIsOpen.mockReset();
  mockSetSelectedConversationId.mockReset();
  mockSetSelectedRoomId.mockReset();
  mockSetNewlyCreatedConversationId.mockReset();
});

const renderConnector = (ui: ReactElement) => render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

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
  test("Message on a user opens a Matrix conversation with that user's id", async () => {
    const roomId = '00000000-0000-4000-8000-000000000003';
    mockCreateRoom.mockResolvedValue({ room_id: `!${roomId}:matrix.test` });
    mockCards = [otherUserCard];
    renderConnector(<ContributorCollectionConnector calloutId="callout-1" />);

    await userEvent.click(screen.getByRole('button', { name: /Actions for Ben/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Message' }));

    expect(mockCreateRoom).toHaveBeenCalledWith({ invite: [`@${otherUserCard.id}:matrix.test`], is_direct: true });
    expect(mockSetSelectedRoomId).toHaveBeenCalledWith(roomId);
  });

  test('a refused Matrix create shows an error and never opens the panel', async () => {
    mockCreateRoom.mockRejectedValue({ errcode: 'M_FORBIDDEN' });
    mockCards = [otherUserCard];
    renderConnector(<ContributorCollectionConnector calloutId="callout-1" />);

    await userEvent.click(screen.getByRole('button', { name: /Actions for Ben/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Message' }));

    expect(mockToastError).toHaveBeenCalledWith("We couldn't open the chat. Please try again.");
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
