/**
 * @vitest-environment jsdom
 * Integration test: Fallback to prompt when no name fields available
 * Task: T051 - Integration test fallback when no name fields
 * Spec: 002-guest-whiteboard-access, Phase 8 - Derived Authenticated Guest Name
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import PublicWhiteboardPage from '@/main/public/whiteboard/PublicWhiteboardPage';
import { CurrentUserFullDocument } from '@/core/apollo/generated/apollo-hooks';

describe('Guest Whiteboard Access - Fallback to Prompt', () => {
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

  it('should show join dialog when both firstName and lastName are null', async () => {
    const whiteboardId = 'wb-no-names';

    const mocks = [
      {
        request: {
          query: CurrentUserFullDocument,
        },
        result: {
          data: {
            me: {
              user: {
                id: 'user-no-names',
                firstName: null,
                lastName: null,
                __typename: 'User',
              },
              __typename: 'MeQueryResults',
            },
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

    // Should show join dialog (fallback behavior)
    await waitFor(
      () => {
        expect(screen.getByText(/join whiteboard/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Guest name should not be derived or stored
    expect(sessionStorage.getItem('alkemio_guest_name')).toBeNull();
  });

  it('should show join dialog when both names are empty strings', async () => {
    const whiteboardId = 'wb-empty-names';

    const mocks = [
      {
        request: {
          query: CurrentUserFullDocument,
        },
        result: {
          data: {
            me: {
              user: {
                id: 'user-empty-names',
                firstName: '',
                lastName: '',
                __typename: 'User',
              },
              __typename: 'MeQueryResults',
            },
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

    await waitFor(
      () => {
        expect(screen.getByText(/join whiteboard/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(sessionStorage.getItem('alkemio_guest_name')).toBeNull();
  });

  it('should show join dialog when both names are whitespace only', async () => {
    const whiteboardId = 'wb-whitespace-names';

    const mocks = [
      {
        request: {
          query: CurrentUserFullDocument,
        },
        result: {
          data: {
            me: {
              user: {
                id: 'user-whitespace',
                firstName: '   ',
                lastName: '   ',
                __typename: 'User',
              },
              __typename: 'MeQueryResults',
            },
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

    await waitFor(
      () => {
        expect(screen.getByText(/join whiteboard/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(sessionStorage.getItem('alkemio_guest_name')).toBeNull();
  });

  it('should show join dialog when user object is missing', async () => {
    const whiteboardId = 'wb-no-user';

    const mocks = [
      {
        request: {
          query: CurrentUserFullDocument,
        },
        result: {
          data: {
            me: {
              user: null,
              __typename: 'MeQueryResults',
            },
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

    await waitFor(
      () => {
        expect(screen.getByText(/join whiteboard/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should show join dialog when CurrentUserFull query returns error', async () => {
    const whiteboardId = 'wb-query-error';

    const mocks = [
      {
        request: {
          query: CurrentUserFullDocument,
        },
        error: new Error('Network error fetching user data'),
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

    // Should fallback to showing join dialog on query error
    await waitFor(
      () => {
        expect(screen.getByText(/join whiteboard/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
