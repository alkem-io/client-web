/**
 * @vitest-environment jsdom
 * Integration test: guest-disabled whiteboard renders 404 experience
 * Spec: 002-guest-whiteboard-access, US4 - Load Failure Handling, FR-013a
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicWhiteboardPage from '@/main/public/whiteboard/PublicWhiteboardPage';
import { GetPublicWhiteboardDocument, CurrentUserFullDocument } from '@/core/apollo/generated/apollo-hooks';
import '@testing-library/jest-dom/vitest';

const mockWhiteboardId = 'guest-disabled-whiteboard';

const buildCurrentUserMock = (): MockedResponse => ({
  request: {
    query: CurrentUserFullDocument,
  },
  result: {
    data: {
      me: {
        __typename: 'MeQueryResults',
        user: null,
      },
    },
  },
});

const withCurrentUserMocks = (responses: MockedResponse[]): MockedResponse[] => [
  buildCurrentUserMock(),
  buildCurrentUserMock(),
  ...responses,
];

describe('Guest Whiteboard Access - Disabled guest contributions', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem('alkemio_guest_name', 'SpecTester');
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('renders the 404 error experience when guestContributionsAllowed is false', async () => {
    const mocks = withCurrentUserMocks([
      {
        request: {
          query: GetPublicWhiteboardDocument,
          variables: { whiteboardId: mockWhiteboardId },
        },
        result: {
          data: {
            lookup: {
              whiteboard: {
                __typename: 'Whiteboard',
                id: mockWhiteboardId,
                guestContributionsAllowed: false,
                profile: {
                  __typename: 'Profile',
                  id: 'profile-id',
                  displayName: 'Disabled Guest Whiteboard',
                  description: null,
                  storageBucket: {
                    __typename: 'StorageBucket',
                    id: 'bucket-id',
                  },
                  url: null,
                },
                content: {},
                createdDate: '2025-10-01T00:00:00Z',
                updatedDate: '2025-10-01T00:00:00Z',
              },
            },
          },
        },
      },
    ]);

    render(
      <MemoryRouter initialEntries={[`/public/whiteboard/${mockWhiteboardId}`]}>
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
    );

    const errorTitle = await screen.findByText(/Whiteboard Not Found/i, {}, { timeout: 3000 });
    expect(errorTitle).toBeInTheDocument();

    const retryButton = screen.queryByRole('button', { name: /try again/i });
    expect(retryButton).not.toBeInTheDocument();

    const whiteboardName = screen.queryByText('Disabled Guest Whiteboard');
    expect(whiteboardName).not.toBeInTheDocument();
  });
});
