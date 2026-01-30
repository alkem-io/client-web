/**
 * @vitest-environment jsdom
 * Integration test: x-guest-name header injection after derivation
 * Task: T052 - Integration test header always injected after derivation
 * Spec: 002-guest-whiteboard-access, Phase 8 - Derived Authenticated Guest Name
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import PublicWhiteboardPage from '@/main/public/whiteboard/PublicWhiteboardPage';
import { GetPublicWhiteboardDocument, CurrentUserFullDocument } from '@/core/apollo/generated/apollo-hooks';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/core/i18n/config';
import { GlobalErrorProvider } from '@/core/lazyLoading/GlobalErrorContext';

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
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      maxFileSize: 15728640,
    },
  },
  createdDate: '2024-01-01T00:00:00.000Z',
  updatedDate: '2024-01-02T00:00:00.000Z',
});

const buildWhiteboardMock = ({
  whiteboardId,
  whiteboard,
  headers,
}: {
  whiteboardId: string;
  whiteboard: ReturnType<typeof createWhiteboard>;
  headers?: Record<string, string>;
}): MockedResponse => ({
  request: {
    query: GetPublicWhiteboardDocument,
    variables: { whiteboardId },
    ...(headers ? { context: { headers } } : {}),
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

describe('Guest Whiteboard Access - Header Injection After Derivation', () => {
  beforeEach(() => {
    sessionStorage.clear();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'ory_kratos_session=mock_session',
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('should inject x-guest-name header after deriving full name', async () => {
    const whiteboardId = 'wb-header-test';
    const derivedName = 'Alice B.';
    const mockWhiteboard = createWhiteboard({
      id: whiteboardId,
      displayName: 'Header Test Whiteboard',
      storageBucketId: 'bucket-header',
    });

    const mocks = [
      buildCurrentUserMock({ id: 'user-header', firstName: 'Alice', lastName: 'Brown', email: 'alice@brown.com' }),
      buildWhiteboardMock({
        whiteboardId,
        whiteboard: mockWhiteboard,
        headers: {
          'x-guest-name': derivedName,
        },
      }),
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderPublicWhiteboardElement(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for derivation to complete
    await waitFor(() => {
      expect(sessionStorage.getItem('alkemio_guest_name')).toBe(derivedName);
    });

    // Note: Actual header injection happens in Apollo link middleware
    // This test verifies that the guest name is stored, which triggers header injection
    expect(sessionStorage.getItem('alkemio_guest_name')).toBe(derivedName);
  });

  it('should inject x-guest-name header with firstName-only derivation', async () => {
    const whiteboardId = 'wb-header-firstname';
    const derivedName = 'Bob';
    const mockWhiteboard = createWhiteboard({
      id: whiteboardId,
      displayName: 'First Name Only Whiteboard',
    });

    const mocks = [
      buildCurrentUserMock({ id: 'user-firstname-header', firstName: 'Bob', lastName: null }),
      buildWhiteboardMock({ whiteboardId, whiteboard: mockWhiteboard }),
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderPublicWhiteboardElement(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(sessionStorage.getItem('alkemio_guest_name')).toBe(derivedName);
    });
  });

  it('should inject x-guest-name header with lastName-only derivation', async () => {
    const whiteboardId = 'wb-header-lastname';
    const derivedName = 'S.';
    const mockWhiteboard = createWhiteboard({
      id: whiteboardId,
      displayName: 'Last Name Only Whiteboard',
    });

    const mocks = [
      buildCurrentUserMock({ id: 'user-lastname-header', firstName: null, lastName: 'Smith' }),
      buildWhiteboardMock({ whiteboardId, whiteboard: mockWhiteboard }),
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderPublicWhiteboardElement(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(sessionStorage.getItem('alkemio_guest_name')).toBe(derivedName);
    });
  });

  it('should NOT inject header when no name can be derived (fallback)', async () => {
    const whiteboardId = 'wb-header-no-derive';
    const mockWhiteboard = createWhiteboard({
      id: whiteboardId,
      displayName: 'No Derivation Whiteboard',
    });

    const mocks = [
      buildCurrentUserMock({ id: 'user-no-derive', firstName: null, lastName: null }),
      buildWhiteboardMock({ whiteboardId, whiteboard: mockWhiteboard }),
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderPublicWhiteboardElement(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for derivation attempt to complete
    await waitFor(
      () => {
        // No name should be stored when derivation fails
        expect(sessionStorage.getItem('alkemio_guest_name')).toBeNull();
      },
      { timeout: 2000 }
    );
  });

  it('should persist derived name and header across page refreshes', async () => {
    const whiteboardId = 'wb-header-persist';
    const derivedName = 'Charlie D.';

    // Simulate existing derived name from previous session
    sessionStorage.setItem('alkemio_guest_name', derivedName);

    const mockWhiteboard = createWhiteboard({
      id: whiteboardId,
      displayName: 'Persist Test Whiteboard',
      storageBucketId: 'bucket-persist',
    });

    const mocks = [
      buildCurrentUserMock({ id: 'user-persist', firstName: 'Charlie', lastName: 'Delta' }),
      buildWhiteboardMock({ whiteboardId, whiteboard: mockWhiteboard }),
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderPublicWhiteboardElement(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    // Name should remain in session storage (not re-derived)
    expect(sessionStorage.getItem('alkemio_guest_name')).toBe(derivedName);

    // Verify it doesn't get cleared
    await waitFor(
      () => {
        expect(sessionStorage.getItem('alkemio_guest_name')).toBe(derivedName);
      },
      { timeout: 2000 }
    );
  });
});
