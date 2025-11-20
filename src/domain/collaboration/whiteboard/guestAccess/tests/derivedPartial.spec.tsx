/**
 * @vitest-environment jsdom
 * Integration test: Partial name derivations (firstName only, lastName only)
 * Task: T050 - Integration test partial name derivations
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
}: {
  id: string;
  displayName: string;
  content?: string;
  storageBucketId?: string;
}) => ({
  __typename: 'Whiteboard' as const,
  id,
  content,
  guestContributionsAllowed: true,
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
  createdBy: {
    __typename: 'User' as const,
    id: `${id}-creator`,
    profile: {
      __typename: 'Profile' as const,
      displayName: `${displayName} Owner`,
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

describe('Guest Whiteboard Access - Partial Name Derivations', () => {
  const mockWhiteboard = createWhiteboard({
    id: 'wb-partial-test',
    displayName: 'Test Whiteboard',
    storageBucketId: 'bucket-123',
  });

  beforeEach(() => {
    sessionStorage.clear();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'ory_kratos_session=mock_session',
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should derive "FirstName" when only firstName provided (lastName null)', async () => {
    const mocks = [
      buildCurrentUserMock({ id: 'user-first-only', firstName: 'Alice', lastName: null, email: 'alice@example.com' }),
      buildWhiteboardMock({ whiteboardId: mockWhiteboard.id, whiteboard: mockWhiteboard }),
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${mockWhiteboard.id}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderPublicWhiteboardElement(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const storedName = sessionStorage.getItem('alkemio_guest_name');
      expect(storedName).toBe('Alice');
    });

    expect(screen.queryByText(/join whiteboard/i)).not.toBeInTheDocument();
  });

  it('should derive "FirstName" when lastName is empty string', async () => {
    const mocks = [
      buildCurrentUserMock({ id: 'user-last-empty', firstName: 'Bob', lastName: '' }),
      buildWhiteboardMock({ whiteboardId: mockWhiteboard.id, whiteboard: mockWhiteboard }),
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${mockWhiteboard.id}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderPublicWhiteboardElement(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(sessionStorage.getItem('alkemio_guest_name')).toBe('Bob');
    });
  });

  it('should derive "L." when only lastName provided (firstName null)', async () => {
    const mocks = [
      buildCurrentUserMock({ id: 'user-last-only', firstName: null, lastName: 'Smith' }),
      buildWhiteboardMock({ whiteboardId: mockWhiteboard.id, whiteboard: mockWhiteboard }),
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${mockWhiteboard.id}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderPublicWhiteboardElement(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(sessionStorage.getItem('alkemio_guest_name')).toBe('S.');
    });

    expect(screen.queryByText(/join whiteboard/i)).not.toBeInTheDocument();
  });

  it('should derive "L." when firstName is empty string', async () => {
    const mocks = [
      buildCurrentUserMock({ id: 'user-first-empty', firstName: '', lastName: 'Jones' }),
      buildWhiteboardMock({ whiteboardId: mockWhiteboard.id, whiteboard: mockWhiteboard }),
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${mockWhiteboard.id}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderPublicWhiteboardElement(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(sessionStorage.getItem('alkemio_guest_name')).toBe('J.');
    });
  });

  it('should handle firstName with whitespace-only lastName', async () => {
    const mocks = [
      buildCurrentUserMock({ id: 'user-last-whitespace', firstName: 'Charlie', lastName: '   ' }),
      buildWhiteboardMock({ whiteboardId: mockWhiteboard.id, whiteboard: mockWhiteboard }),
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${mockWhiteboard.id}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderPublicWhiteboardElement(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(sessionStorage.getItem('alkemio_guest_name')).toBe('Charlie');
    });
  });
});
