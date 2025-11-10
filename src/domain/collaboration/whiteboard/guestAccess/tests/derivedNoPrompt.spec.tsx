/**
 * @vitest-environment jsdom
 * Integration test: Authenticated user with full name gets derived guest name (no prompt)
 * Task: T049 - Integration test derived name no prompt
 * Spec: 002-guest-whiteboard-access, Phase 8 - Derived Authenticated Guest Name
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import PublicWhiteboardPage from '@/main/public/whiteboard/PublicWhiteboardPage';
import {
  GetPublicWhiteboardDocument,
  CurrentUserFullDocument,
} from '@/core/apollo/generated/apollo-hooks';

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
    const mockWhiteboard = {
      id: whiteboardId,
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

    const mocks = [
      {
        request: {
          query: CurrentUserFullDocument,
        },
        result: {
          data: {
            me: {
              user: {
                id: 'user-123',
                firstName: 'Alice',
                lastName: 'Brown',
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
          variables: { whiteboardId },
        },
        result: {
          data: {
            publicWhiteboard: mockWhiteboard,
          },
        },
      },
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
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
    const mockWhiteboard = {
      id: whiteboardId,
      content: '{"elements":[],"appState":{}}',
      profile: {
        displayName: 'Test Whiteboard 2',
        __typename: 'Profile',
        storageBucket: {
          id: 'bucket-456',
          __typename: 'StorageBucket',
        },
      },
      __typename: 'Whiteboard',
    };

    // Pre-set derived guest name in session storage
    sessionStorage.setItem('alkemio_guest_name', 'Alice B.');

    const mocks = [
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        result: {
          data: {
            publicWhiteboard: mockWhiteboard,
          },
        },
      },
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
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
    const mockWhiteboard = {
      id: whiteboardId,
      content: '{"elements":[],"appState":{}}',
      profile: {
        displayName: 'Test Whiteboard',
        __typename: 'Profile',
        storageBucket: {
          id: 'bucket-789',
          __typename: 'StorageBucket',
        },
      },
      __typename: 'Whiteboard',
    };

    const mocks = [
      {
        request: {
          query: CurrentUserFullDocument,
        },
        result: {
          data: {
            me: {
              user: {
                id: 'user-456',
                firstName: 'Mary Anne',
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
          variables: { whiteboardId },
        },
        result: {
          data: {
            publicWhiteboard: mockWhiteboard,
          },
        },
      },
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
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

    // Wait for derivation
    await waitFor(() => {
      const storedName = sessionStorage.getItem('alkemio_guest_name');
      expect(storedName).toBe('Mary S.');
    });

    // No dialog shown
    expect(screen.queryByText(/join whiteboard/i)).not.toBeInTheDocument();
  });
});
