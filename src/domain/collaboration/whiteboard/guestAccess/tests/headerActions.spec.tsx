/**
 * Integration tests for header actions in public whiteboard view
 * Tests the presence and functionality of Share, Fullscreen, and Save Indicator
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup, screen } from '@/main/test/testUtils';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicWhiteboardPage from '@/main/public/whiteboard/PublicWhiteboardPage';
import { MockedProvider } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';
import { GetPublicWhiteboardDocument, CurrentUserFullDocument } from '@/core/apollo/generated/apollo-hooks';
import { GuestSessionProvider } from '../context/GuestSessionContext';
import { sessionStorageMock } from './utils/sessionStorageMock';

// Mock dependencies
vi.mock('@/core/ui/fullscreen/useFullscreen', () => ({
  useFullscreen: () => ({
    fullscreen: false,
    setFullscreen: vi.fn(),
  }),
}));

// Mock ShareButton to verify it receives correct props
vi.mock('@/domain/shared/components/ShareDialog/ShareButton', () => ({
  default: (props: { url?: string; disabled?: boolean; showShareOnAlkemio?: boolean }) => {
    return (
      <button
        data-testid="share-button"
        data-url={props.url}
        disabled={props.disabled}
        data-show-share-on-alkemio={props.showShareOnAlkemio}
      >
        Share
      </button>
    );
  },
}));

// Mock WhiteboardDialog to expose header actions
vi.mock('@/domain/collaboration/whiteboard/WhiteboardDialog/WhiteboardDialog', () => ({
  default: ({
    options,
  }: {
    options: { headerActions?: (args: { mode: string }) => React.ReactNode; dialogTitle?: string };
  }) => {
    return (
      <div data-testid="whiteboard-dialog">
        <div data-testid="dialog-header">{options.headerActions?.({ mode: 'write' })}</div>
        <h1>{options.dialogTitle}</h1>
      </div>
    );
  },
}));

const mockWhiteboardId = '123e4567-e89b-12d3-a456-426614174000';
const mockGuestName = 'TestGuest';

const mockWhiteboardData = {
  lookup: {
    whiteboard: {
      __typename: 'Whiteboard',
      id: mockWhiteboardId,
      content: {},
      guestContributionsAllowed: true,
      profile: {
        id: 'profile-id',
        displayName: 'Test Whiteboard',
        description: 'Test Description',
        url: 'http://test.url',
        storageBucket: {
          id: 'bucket-id',
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
          maxFileSize: 15728640,
        },
      },
      createdDate: '2023-01-01T00:00:00Z',
      updatedDate: '2023-01-01T00:00:00Z',
      authorization: {
        myPrivileges: [],
      },
    },
  },
};

const mocks = [
  {
    request: {
      query: GetPublicWhiteboardDocument,
      variables: { whiteboardId: mockWhiteboardId },
    },
    result: {
      data: mockWhiteboardData,
    },
  },
  {
    request: {
      query: CurrentUserFullDocument,
      variables: {},
    },
    result: {
      data: {
        me: {
          user: null,
        },
      },
    },
  },
];

describe('PublicWhiteboardPage - Header Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.clear();
    // Set guest name to bypass join dialog
    sessionStorageMock.setItem('alkemio_guest_name', mockGuestName);
  });

  afterEach(() => {
    cleanup();
  });

  const renderPage = () => {
    return render(
      <MockedProvider mocks={mocks} cache={new InMemoryCache()}>
        <MemoryRouter initialEntries={[`/public/whiteboard/${mockWhiteboardId}`]}>
          <GuestSessionProvider>
            <Routes>
              <Route path="/public/whiteboard/:whiteboardId" element={<PublicWhiteboardPage />} />
            </Routes>
          </GuestSessionProvider>
        </MemoryRouter>
      </MockedProvider>
    );
  };

  it('should render Share button in header with correct props', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('whiteboard-dialog')).toBeInTheDocument();
    });

    const shareButton = screen.getByTestId('share-button');
    // In jsdom, window.location.origin is http://localhost:3000
    expect(shareButton).toHaveAttribute('data-url', `http://localhost:3000/public/whiteboard/${mockWhiteboardId}`);
    expect(shareButton).toHaveAttribute('data-show-share-on-alkemio', 'false');
  });

  it('should render Fullscreen button in header', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('whiteboard-dialog')).toBeInTheDocument();
    });

    // FullscreenButton renders a button with title "Toggle full screen"
    const fullscreenButton = screen.getByRole('button', { name: /toggle full screen/i });
    expect(fullscreenButton).toBeInTheDocument();
  });

  it('should render Save indicator in header', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('whiteboard-dialog')).toBeInTheDocument();
    });

    // SaveRequestIndicatorIcon renders CloudDoneIcon when saved
    const saveIndicator = screen.getByTestId('CloudDoneIcon');
    expect(saveIndicator).toBeInTheDocument();
  });
});
