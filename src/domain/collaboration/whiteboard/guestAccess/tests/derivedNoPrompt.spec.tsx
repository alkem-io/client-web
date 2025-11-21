/**
 * @vitest-environment jsdom
 * Integration test: Authenticated user with full name gets derived guest name (no prompt)
 * Task: T049 - Integration test derived name no prompt
 * Spec: 002-guest-whiteboard-access, Phase 8 - Derived Authenticated Guest Name
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import PublicWhiteboardPage from '@/main/public/whiteboard/PublicWhiteboardPage';
import { GetPublicWhiteboardDocument, CurrentUserFullDocument } from '@/core/apollo/generated/apollo-hooks';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import { GlobalErrorProvider } from '@/core/lazyLoading/GlobalErrorContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/core/i18n/config';

vi.mock('@/domain/collaboration/whiteboard/WhiteboardDialog/WhiteboardDialog', () => {
  return {
    __esModule: true,
    default: ({ options }: { options: { dialogTitle: string } }) => (
      <div data-testid="whiteboard-dialog">{options.dialogTitle}</div>
    ),
  };
});

const buildCurrentUserMock = ({
  id,
  firstName,
  lastName,
  email = `${id}@example.com`,
}: {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email?: string;
}): MockedResponse => ({
  request: {
    query: CurrentUserFullDocument,
  },
  result: {
    data: {
      me: {
        __typename: 'MeQueryResults',
        user: {
          id,
          firstName,
          lastName,
          email,
          phone: '',
          profile: {
            id: `${id}-profile`,
            displayName: `${firstName ?? lastName ?? 'Guest'} Profile`,
            tagline: null,
            location: {
              id: `${id}-location`,
              country: null,
              city: null,
              __typename: 'Location',
            },
            description: null,
            avatar: null,
            references: [],
            tagsets: [],
            url: null,
            __typename: 'Profile',
          },
          account: {
            id: `${id}-account`,
            authorization: {
              id: `${id}-authorization`,
              myPrivileges: [],
              __typename: 'Authorization',
            },
            license: {
              id: `${id}-license`,
              availableEntitlements: [],
              __typename: 'License',
            },
            __typename: 'Account',
          },
          __typename: 'User',
        },
      },
    },
  },
});

const createWhiteboard = ({
  id,
  displayName,
  content = '{"elements":[],"appState":{}}',
  storageBucketId = `${id}-bucket`,
  guestContributionsAllowed = true,
}: {
  id: string;
  displayName: string;
  content?: string;
  storageBucketId?: string;
  guestContributionsAllowed?: boolean;
}) => ({
  __typename: 'Whiteboard' as const,
  id,
  content,
  guestContributionsAllowed,
  profile: {
    __typename: 'Profile' as const,
    id: `${id}-profile`,
    displayName,
    description: null,
    url: null,
    storageBucket: {
      __typename: 'StorageBucket' as const,
      id: storageBucketId,
    },
  },
  createdDate: '2024-01-01T00:00:00.000Z',
  updatedDate: '2024-01-02T00:00:00.000Z',
});

const buildWhiteboardMock = ({
  whiteboardId,
  whiteboard,
}: {
  whiteboardId: string;
  whiteboard: ReturnType<typeof createWhiteboard>;
}): MockedResponse => ({
  request: {
    query: GetPublicWhiteboardDocument,
    variables: { whiteboardId },
  },
  result: {
    data: {
      lookup: {
        whiteboard,
      },
    },
  },
});

const renderPublicWhiteboardElement = (mocks: MockedResponse[]) => (
  <MockedProvider mocks={mocks} cache={new InMemoryCache()}>
    <RootThemeProvider>
      <GlobalStateProvider>
        <GlobalErrorProvider>
          <I18nextProvider i18n={i18n}>
            <PublicWhiteboardPage />
          </I18nextProvider>
        </GlobalErrorProvider>
      </GlobalStateProvider>
    </RootThemeProvider>
  </MockedProvider>
);

describe('Guest Whiteboard Access - Derived Name No Prompt', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // Mock auth cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'ory_kratos_session=mock_session_token',
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('should derive guest name from authenticated user with full name (no dialog shown)', async () => {
    const whiteboardId = 'wb-with-auth-user';
    const mockWhiteboard = createWhiteboard({
      id: whiteboardId,
      displayName: 'Test Whiteboard',
      storageBucketId: 'bucket-123',
    });

    const mocks = [
      buildCurrentUserMock({ id: 'user-123', firstName: 'Alice', lastName: 'Brown' }),
      buildWhiteboardMock({ whiteboardId, whiteboard: mockWhiteboard }),
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderPublicWhiteboardElement(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    // Should NOT show join dialog
    await waitFor(
      () => {
        expect(screen.queryByText(/join whiteboard/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should derive guest name and store it
    await waitFor(() => {
      const storedName = sessionStorage.getItem('alkemio_guest_name');
      expect(storedName).toBe('Alice B.');
    });

    // Whiteboard should load successfully
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('should use derived name for subsequent requests (no re-derivation)', async () => {
    const whiteboardId = 'wb-reuse-derived';
    const mockWhiteboard = createWhiteboard({
      id: whiteboardId,
      displayName: 'Test Whiteboard 2',
      storageBucketId: 'bucket-456',
    });

    // Pre-set derived guest name in session storage
    sessionStorage.setItem('alkemio_guest_name', 'Alice B.');

    const mocks = [
      buildCurrentUserMock({ id: 'user-123', firstName: 'Alice', lastName: 'Brown' }),
      buildWhiteboardMock({ whiteboardId, whiteboard: mockWhiteboard }),
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderPublicWhiteboardElement(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    // Should NOT show join dialog (name already exists)
    await waitFor(
      () => {
        expect(screen.queryByText(/join whiteboard/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Stored name should remain unchanged
    expect(sessionStorage.getItem('alkemio_guest_name')).toBe('Alice B.');
  });

  it('should derive name with multi-word first name correctly', async () => {
    const whiteboardId = 'wb-multiword-first';
    const mockWhiteboard = createWhiteboard({
      id: whiteboardId,
      displayName: 'Test Whiteboard',
      storageBucketId: 'bucket-789',
    });

    const mocks = [
      buildCurrentUserMock({ id: 'user-456', firstName: 'Mary Anne', lastName: 'Smith' }),
      buildWhiteboardMock({ whiteboardId, whiteboard: mockWhiteboard }),
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderPublicWhiteboardElement(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for derivation
    await waitFor(() => {
      const storedName = sessionStorage.getItem('alkemio_guest_name');
      expect(storedName).toBe('Mary S.');
    });

    // No dialog shown
    expect(screen.queryByText(/join whiteboard/i)).not.toBeInTheDocument();
  });
});
