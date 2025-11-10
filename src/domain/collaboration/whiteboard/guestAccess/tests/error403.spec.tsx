/**
 * @vitest-environment jsdom
 * Integration test: 403 error scenario for guest whiteboard access
 * Task: T041 - Test 403 (forbidden) error handling
 * Spec: 002-guest-whiteboard-access, US4 - Load Failure Handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicWhiteboardPage from '@/main/public/whiteboard/PublicWhiteboardPage';
import { GetPublicWhiteboardDocument } from '@/core/apollo/generated/apollo-hooks';

import '@testing-library/jest-dom/vitest';
describe('Guest Whiteboard Access - 403 Error Handling', () => {
  beforeEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it('should display 403 error message when access is forbidden', async () => {
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');
    const whiteboardId = 'private-whiteboard-id';

    const mocks = [
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

    // Wait for error state to appear
    const errorTitle = await screen.findByText(/Access Denied/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();

    // Verify error message - check for key parts
    const errorMessage = screen.getByText(/not available for guest access/i);
    expect(errorMessage).toBeInTheDocument();

    // Verify retry button is present
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should handle retry after 403 error', async () => {
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');
    const whiteboardId = 'private-whiteboard-id';

    const mocks = [
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

    // Wait for error state
    const errorTitle = await screen.findByText(/Access Denied/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    retryButton.click();

    // Error should still be displayed after retry
    const errorTitleAfterRetry = await screen.findByText(/Access Denied/i, {}, { timeout: 3000 });
    expect(errorTitleAfterRetry).toBeInTheDocument();
  });

  it('should detect 403 from error message containing "forbidden"', async () => {
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');
    const whiteboardId = 'restricted-board';

    const mocks = [
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

    // Should show 403-specific error message
    const errorTitle = await screen.findByText(/Access Denied/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();
  });

  it('should suggest sign-in for 403 error', async () => {
    sessionStorage.setItem('alkemio_guest_name', 'TestUser');
    const whiteboardId = 'private-whiteboard-id';

    const mocks = [
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

    // Wait for error state
    const errorTitle = await screen.findByText(/Access Denied/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();

    // Verify contact owner message is present
    const contactMessage = screen.getByText(/contact the whiteboard owner/i);
    expect(contactMessage).toBeInTheDocument();
  });
});
