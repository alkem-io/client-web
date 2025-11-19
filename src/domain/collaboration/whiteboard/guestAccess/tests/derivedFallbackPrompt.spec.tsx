/**
 * @vitest-environment jsdom
 * Integration test: Derived guest name fallback keeps prompt visible
 * Task: T051 - Derived authenticated guest name fallback
 * Spec: 002-guest-whiteboard-access, Phase 8 - Derived Authenticated Guest Name
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { FC, PropsWithChildren } from 'react';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/core/i18n/config';
import { CurrentUserFullDocument } from '@/core/apollo/generated/apollo-hooks';
import { GuestSessionProvider } from '../context/GuestSessionContext';
import { useGuestSession } from '../hooks/useGuestSession';

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionStorageMock,
  configurable: true,
  writable: true,
});

if (globalThis.window !== undefined) {
  Object.defineProperty(globalThis.window, 'sessionStorage', {
    value: sessionStorageMock,
    configurable: true,
    writable: true,
  });
}

const createWrapper = (mocks: MockedResponse[]): FC<PropsWithChildren> => {
  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <MockedProvider mocks={mocks} cache={new InMemoryCache()}>
      <RootThemeProvider>
        <I18nextProvider i18n={i18n}>
          <GuestSessionProvider>{children}</GuestSessionProvider>
        </I18nextProvider>
      </RootThemeProvider>
    </MockedProvider>
  );

  return Wrapper;
};

const buildUserMock = ({
  id,
  firstName,
  lastName,
  includeUser = true,
}: {
  id: string;
  firstName: string | null;
  lastName: string | null;
  includeUser?: boolean;
}): MockedResponse[] => [
  {
    request: {
      query: CurrentUserFullDocument,
    },
    result: {
      data: {
        me: {
          user: includeUser
            ? {
                id,
                firstName,
                lastName,
                email: 'user@example.com',
                phone: '',
                profile: {
                  id: `${id}-profile`,
                  displayName: 'Test User',
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
                    id: `${id}-auth`,
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
              }
            : null,
          __typename: 'MeQueryResults',
        },
      },
    },
  },
];

describe('Guest whiteboard fallback prompt derivation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.clear();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'ory_kratos_session=mock_session',
    });
  });

  afterEach(() => {
    sessionStorageMock.clear();
  });

  it('keeps guest name unset when both firstName and lastName are null', async () => {
    const mocks = buildUserMock({ id: 'user-no-names', firstName: null, lastName: null });
    const { result } = renderHook(() => useGuestSession(), { wrapper: createWrapper(mocks) });

    await waitFor(() => {
      expect(result.current.derivationAttempted).toBe(true);
    });

    expect(result.current.guestName).toBeNull();
    expect(sessionStorage.getItem('alkemio_guest_name')).toBeNull();
  });

  it('keeps guest name unset when both names are empty strings', async () => {
    const mocks = buildUserMock({ id: 'user-empty-names', firstName: '', lastName: '' });
    const { result } = renderHook(() => useGuestSession(), { wrapper: createWrapper(mocks) });

    await waitFor(() => {
      expect(result.current.derivationAttempted).toBe(true);
    });

    expect(result.current.guestName).toBeNull();
    expect(sessionStorage.getItem('alkemio_guest_name')).toBeNull();
  });

  it('keeps guest name unset when both names are whitespace only', async () => {
    const mocks = buildUserMock({ id: 'user-whitespace', firstName: '   ', lastName: '   ' });
    const { result } = renderHook(() => useGuestSession(), { wrapper: createWrapper(mocks) });

    await waitFor(() => {
      expect(result.current.derivationAttempted).toBe(true);
    });

    expect(result.current.guestName).toBeNull();
    expect(sessionStorage.getItem('alkemio_guest_name')).toBeNull();
  });

  it('keeps guest name unset when user object is missing', async () => {
    const mocks = buildUserMock({ id: 'user-null', firstName: null, lastName: null, includeUser: false });
    const { result } = renderHook(() => useGuestSession(), { wrapper: createWrapper(mocks) });

    await waitFor(() => {
      expect(result.current.derivationAttempted).toBe(true);
    });

    expect(result.current.guestName).toBeNull();
    expect(sessionStorage.getItem('alkemio_guest_name')).toBeNull();
  });

  it('keeps guest name unset when CurrentUserFull query errors', async () => {
    const mocks: MockedResponse[] = [
      {
        request: {
          query: CurrentUserFullDocument,
        },
        error: new Error('Network error fetching user data'),
      },
    ];

    const { result } = renderHook(() => useGuestSession(), { wrapper: createWrapper(mocks) });

    await waitFor(() => {
      expect(result.current.derivationAttempted).toBe(true);
    });

    expect(result.current.guestName).toBeNull();
    expect(sessionStorage.getItem('alkemio_guest_name')).toBeNull();
  });
});
