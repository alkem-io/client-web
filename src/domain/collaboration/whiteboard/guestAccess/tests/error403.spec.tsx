/**
 * @vitest-environment jsdom
 * Integration test: 403 error scenario for guest whiteboard access
 * Task: T041 - Test 403 (forbidden) error handling
 * Spec: 002-guest-whiteboard-access, US4 - Load Failure Handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicWhiteboardPage from '@/main/public/whiteboard/PublicWhiteboardPage';
import { GetPublicWhiteboardDocument, CurrentUserFullDocument } from '@/core/apollo/generated/apollo-hooks';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import { GlobalErrorProvider } from '@/core/lazyLoading/GlobalErrorContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/core/i18n/config';

import '@testing-library/jest-dom/vitest';

const buildCurrentUserMock = (): MockedResponse => ({
  request: {
    query: CurrentUserFullDocument,
  },
  result: {
    data: {
      me: {
        __typename: 'MeQueryResults',
        user: {
          id: 'user-current',
          firstName: 'Guest',
          lastName: 'User',
          email: 'guest.user@example.com',
          phone: '',
          profile: {
            __typename: 'Profile',
            id: 'user-current-profile',
            displayName: 'Guest User',
            tagline: null,
            location: {
              __typename: 'Location',
              id: 'user-current-location',
              country: null,
              city: null,
            },
            description: null,
            avatar: null,
            references: [],
            tagsets: [],
            url: null,
          },
          account: {
            __typename: 'Account',
            id: 'user-current-account',
            authorization: {
              __typename: 'Authorization',
              id: 'user-current-authorization',
              myPrivileges: [],
            },
            license: {
              __typename: 'License',
              id: 'user-current-license',
              availableEntitlements: [],
            },
          },
          __typename: 'User',
        },
      },
    },
  },
});

const renderWithProviders = (mocks: MockedResponse[]) => (
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
describe('Guest Whiteboard Access - 403 Error Handling', () => {
  beforeEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it('should display 404 error experience when access is forbidden', async () => {
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');
    const whiteboardId = 'private-whiteboard-id';

    const mocks = [
      buildCurrentUserMock(),
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        error: new Error('Access forbidden (403)'),
      },
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderWithProviders(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for error state to appear
    const errorTitle = await screen.findByText(/Whiteboard Not Found/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();

    // Verify error message - check for key parts
    const errorMessage = screen.getByText(/may be incorrect or the whiteboard may have been deleted/i);
    expect(errorMessage).toBeInTheDocument();

    // Verify retry button is present
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should handle retry after 403 error', async () => {
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');
    const whiteboardId = 'private-whiteboard-id';

    const mocks = [
      buildCurrentUserMock(),
      buildCurrentUserMock(),
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        error: new Error('Access forbidden (403)'),
      },
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        error: new Error('Access forbidden (403)'),
      },
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderWithProviders(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for error state
    const errorTitle = await screen.findByText(/Whiteboard Not Found/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    retryButton.click();

    // Error should still be displayed after retry
    const errorTitleAfterRetry = await screen.findByText(/Whiteboard Not Found/i, {}, { timeout: 3000 });
    expect(errorTitleAfterRetry).toBeInTheDocument();
  });

  it('should detect 403 from error message containing "forbidden"', async () => {
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');
    const whiteboardId = 'restricted-board';

    const mocks = [
      buildCurrentUserMock(),
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        error: new Error('GraphQL error: forbidden - Insufficient permissions'),
      },
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderWithProviders(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    // Should show 403-specific error message
    const errorTitle = await screen.findByText(/Whiteboard Not Found/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();
  });

  it('should surface neutral 404 messaging for 403 error', async () => {
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');
    const whiteboardId = 'private-whiteboard-id';

    const mocks = [
      buildCurrentUserMock(),
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        error: new Error('Access forbidden (403)'),
      },
    ];

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
        <Routes>
          <Route path="/public/whiteboard/:whiteboardId" element={renderWithProviders(mocks)} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for error state
    const errorTitle = await screen.findByText(/Whiteboard Not Found/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();

    // Verify generic guidance message is presented
    const guidanceMessage = screen.getByText(/may be incorrect or the whiteboard may have been deleted/i);
    expect(guidanceMessage).toBeInTheDocument();
  });
});
