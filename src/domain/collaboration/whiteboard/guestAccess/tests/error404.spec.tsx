/**
 * @vitest-environment jsdom
 * Integration test: 404 error scenario for guest whiteboard access
 * Task: T040 - Test 404 (not found) error handling
 * Spec: 002-guest-whiteboard-access, US4 - Load Failure Handling
 */

import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { cleanup, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CurrentUserLightDocument, GetPublicWhiteboardDocument } from '@/core/apollo/generated/apollo-hooks';
import i18n from '@/core/i18n/config';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import PublicWhiteboardPage from '@/main/public/whiteboard/PublicWhiteboardPage';
import '@testing-library/jest-dom/vitest';

const buildCurrentUserMock = (): MockedResponse => ({
  request: {
    query: CurrentUserLightDocument,
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

describe('Guest Whiteboard Access - 404 Error Handling', () => {
  beforeEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it('should display 404 error message when whiteboard not found', async () => {
    const whiteboardId = 'nonexistent-whiteboard-id';
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');

    const mocks = withCurrentUserMocks([
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        error: new Error('Whiteboard not found (404)'),
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
    const errorTitle = await screen.findByText(/Whiteboard Not Found/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();

    // Verify error message - check for key parts
    const errorMessage = screen.getByText(/whiteboard link may be incorrect/i);
    expect(errorMessage).toBeInTheDocument();

    // Verify retry button is present
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should handle retry after 404 error', async () => {
    const whiteboardId = 'nonexistent-whiteboard-id';
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');

    const mocks = withCurrentUserMocks([
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        error: new Error('Whiteboard not found (404)'),
      },
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        error: new Error('Whiteboard not found (404)'),
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
    const errorTitle = await screen.findByText(/Whiteboard Not Found/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    retryButton.click();

    // Error should still be displayed after retry (since mock still returns error)
    const errorTitleAfterRetry = await screen.findByText(/Whiteboard Not Found/i, {}, { timeout: 3000 });
    expect(errorTitleAfterRetry).toBeInTheDocument();
  });

  it('should detect 404 from error message containing "404"', async () => {
    const whiteboardId = 'missing-board';
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');

    const mocks = withCurrentUserMocks([
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId },
        },
        error: new Error('GraphQL error: 404 - Resource not found'),
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

    // Should show 404-specific error message
    const errorTitle = await screen.findByText(/Whiteboard Not Found/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();
  });
});
