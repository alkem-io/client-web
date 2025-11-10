/**
 * @vitest-environment jsdom
 * Integration test: Partial name derivations (firstName only, lastName only)
 * Task: T050 - Integration test partial name derivations
 * Spec: 002-guest-whiteboard-access, Phase 8 - Derived Authenticated Guest Name
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import PublicWhiteboardPage from '@/main/public/whiteboard/PublicWhiteboardPage';
import {
  GetPublicWhiteboardDocument,
  CurrentUserFullDocument,
} from '@/core/apollo/generated/apollo-hooks';

describe('Guest Whiteboard Access - Partial Name Derivations', () => {
  const mockWhiteboard = {
    id: 'wb-partial-test',
    content: '{"elements":[],"appState":{}}',
    profile: {
      displayName: 'Test Whiteboard',
      __typename: 'Profile',
      storageBucket: {
        id: 'bucket-123',
        __typename: 'StorageBucket',
      },
    },
    __typename: 'Whiteboard',
  };

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
      {
        request: {
          query: CurrentUserFullDocument,
        },
        result: {
          data: {
            me: {
              user: {
                id: 'user-first-only',
                firstName: 'Alice',
                lastName: null,
                __typename: 'User',
              },
              __typename: 'MeQueryResults',
            },
          },
        },
      },
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId: mockWhiteboard.id },
        },
        result: {
          data: {
            publicWhiteboard: mockWhiteboard,
          },
        },
      },
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${mockWhiteboard.id}`]}>
        <Routes>
          <Route
            path="/public/whiteboard/:whiteboardId"
            element={
              <MockedProvider mocks={mocks} addTypename={false}>
                <PublicWhiteboardPage />
              </MockedProvider>
            }
          />
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
      {
        request: {
          query: CurrentUserFullDocument,
        },
        result: {
          data: {
            me: {
              user: {
                id: 'user-last-empty',
                firstName: 'Bob',
                lastName: '',
                __typename: 'User',
              },
              __typename: 'MeQueryResults',
            },
          },
        },
      },
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId: mockWhiteboard.id },
        },
        result: {
          data: {
            publicWhiteboard: mockWhiteboard,
          },
        },
      },
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${mockWhiteboard.id}`]}>
        <Routes>
          <Route
            path="/public/whiteboard/:whiteboardId"
            element={
              <MockedProvider mocks={mocks} addTypename={false}>
                <PublicWhiteboardPage />
              </MockedProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(sessionStorage.getItem('alkemio_guest_name')).toBe('Bob');
    });
  });

  it('should derive "L." when only lastName provided (firstName null)', async () => {
    const mocks = [
      {
        request: {
          query: CurrentUserFullDocument,
        },
        result: {
          data: {
            me: {
              user: {
                id: 'user-last-only',
                firstName: null,
                lastName: 'Smith',
                __typename: 'User',
              },
              __typename: 'MeQueryResults',
            },
          },
        },
      },
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId: mockWhiteboard.id },
        },
        result: {
          data: {
            publicWhiteboard: mockWhiteboard,
          },
        },
      },
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${mockWhiteboard.id}`]}>
        <Routes>
          <Route
            path="/public/whiteboard/:whiteboardId"
            element={
              <MockedProvider mocks={mocks} addTypename={false}>
                <PublicWhiteboardPage />
              </MockedProvider>
            }
          />
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
      {
        request: {
          query: CurrentUserFullDocument,
        },
        result: {
          data: {
            me: {
              user: {
                id: 'user-first-empty',
                firstName: '',
                lastName: 'Jones',
                __typename: 'User',
              },
              __typename: 'MeQueryResults',
            },
          },
        },
      },
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId: mockWhiteboard.id },
        },
        result: {
          data: {
            publicWhiteboard: mockWhiteboard,
          },
        },
      },
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${mockWhiteboard.id}`]}>
        <Routes>
          <Route
            path="/public/whiteboard/:whiteboardId"
            element={
              <MockedProvider mocks={mocks} addTypename={false}>
                <PublicWhiteboardPage />
              </MockedProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(sessionStorage.getItem('alkemio_guest_name')).toBe('J.');
    });
  });

  it('should handle firstName with whitespace-only lastName', async () => {
    const mocks = [
      {
        request: {
          query: CurrentUserFullDocument,
        },
        result: {
          data: {
            me: {
              user: {
                id: 'user-last-whitespace',
                firstName: 'Charlie',
                lastName: '   ',
                __typename: 'User',
              },
              __typename: 'MeQueryResults',
            },
          },
        },
      },
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId: mockWhiteboard.id },
        },
        result: {
          data: {
            publicWhiteboard: mockWhiteboard,
          },
        },
      },
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${mockWhiteboard.id}`]}>
        <Routes>
          <Route
            path="/public/whiteboard/:whiteboardId"
            element={
              <MockedProvider mocks={mocks} addTypename={false}>
                <PublicWhiteboardPage />
              </MockedProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(sessionStorage.getItem('alkemio_guest_name')).toBe('Charlie');
    });
  });
});
