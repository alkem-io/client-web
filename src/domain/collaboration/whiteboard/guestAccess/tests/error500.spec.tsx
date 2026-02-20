/**
 * @vitest-environment jsdom
 * Integration test: 500 error scenario for guest whiteboard access
 * Task: T042 - Test 500 (generic server error) handling
 * Spec: 002-guest-whiteboard-access, US4 - Load Failure Handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicWhiteboardPage from '@/main/public/whiteboard/PublicWhiteboardPage';
import { GetPublicWhiteboardDocument, CurrentUserFullDocument } from '@/core/apollo/generated/apollo-hooks';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
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
        user: null,
        __typename: 'MeQueryResults',
      },
    },
  },
});

const withCurrentUserMocks = (responses: MockedResponse[]): MockedResponse[] => [
  buildCurrentUserMock(),
  buildCurrentUserMock(),
  ...responses,
];

describe('Guest Whiteboard Access - 500 Error Handling', () => {
  beforeEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it('should display generic error message for server error', async () => {
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');
    const whiteboardId = 'any-whiteboard-id';

    const mocks = withCurrentUserMocks([
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        error: new Error('Internal server error'),
      },
    ]);

    render(
      <RootThemeProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
            <Routes>
              <Route
                path="/public/whiteboard/:whiteboardId"
                element={
                  <MockedProvider mocks={mocks} cache={new InMemoryCache()}>
                    <PublicWhiteboardPage />
                  </MockedProvider>
                }
              />
            </Routes>
          </MemoryRouter>
        </I18nextProvider>
      </RootThemeProvider>
    );

    // Wait for error state to appear
    const errorTitle = await screen.findByText(/Unable to Load Whiteboard/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();

    // Verify error message - check for key parts
    const errorMessage = screen.getByText(/try again later/i);
    expect(errorMessage).toBeInTheDocument();

    // Verify retry button is present
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should handle retry after server error', async () => {
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');
    const whiteboardId = 'any-whiteboard-id';

    const mocks = withCurrentUserMocks([
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        error: new Error('Database connection failed'),
      },
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        error: new Error('Database connection failed'),
      },
    ]);

    render(
      <RootThemeProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
            <Routes>
              <Route
                path="/public/whiteboard/:whiteboardId"
                element={
                  <MockedProvider mocks={mocks} cache={new InMemoryCache()}>
                    <PublicWhiteboardPage />
                  </MockedProvider>
                }
              />
            </Routes>
          </MemoryRouter>
        </I18nextProvider>
      </RootThemeProvider>
    );

    // Wait for error state
    const errorTitle = await screen.findByText(/Unable to Load Whiteboard/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    retryButton.click();

    // Error should still be displayed after retry
    const errorTitleAfterRetry = await screen.findByText(/Unable to Load Whiteboard/i, {}, { timeout: 3000 });
    expect(errorTitleAfterRetry).toBeInTheDocument();
  });

  it('should display generic error for network error', async () => {
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');
    const whiteboardId = 'any-whiteboard-id';

    const mocks = withCurrentUserMocks([
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        error: new Error('Network request failed'),
      },
    ]);

    render(
      <RootThemeProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
            <Routes>
              <Route
                path="/public/whiteboard/:whiteboardId"
                element={
                  <MockedProvider mocks={mocks} cache={new InMemoryCache()}>
                    <PublicWhiteboardPage />
                  </MockedProvider>
                }
              />
            </Routes>
          </MemoryRouter>
        </I18nextProvider>
      </RootThemeProvider>
    );

    // Should show generic error message for network errors
    const errorTitle = await screen.findByText(/Unable to Load Whiteboard/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();
  });

  it('should display generic error for GraphQL error without status code', async () => {
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');
    const whiteboardId = 'any-whiteboard-id';

    const mocks = withCurrentUserMocks([
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        error: new Error('GraphQL error: Something unexpected happened'),
      },
    ]);

    render(
      <RootThemeProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={[`/public/whiteboard/${whiteboardId}`]}>
            <Routes>
              <Route
                path="/public/whiteboard/:whiteboardId"
                element={
                  <MockedProvider mocks={mocks} cache={new InMemoryCache()}>
                    <PublicWhiteboardPage />
                  </MockedProvider>
                }
              />
            </Routes>
          </MemoryRouter>
        </I18nextProvider>
      </RootThemeProvider>
    );

    // Should show generic error message
    const errorTitle = await screen.findByText(/Unable to Load Whiteboard/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();

    const errorMessage = screen.getByText(/try again later|check your internet connection/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
