/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@/main/test/testUtils';
import { AuthorizationPrivilege, CommunityMembershipStatus } from '@/core/apollo/generated/graphql-schema';
import WhiteboardView from './WhiteboardView';
import type { WhiteboardDetails } from '../WhiteboardDialog/WhiteboardDialog';

// Capture the props passed to WhiteboardDialog
let capturedDialogProps: Record<string, unknown> = {};

vi.mock('../WhiteboardDialog/WhiteboardDialog', () => ({
  default: (props: Record<string, unknown>) => {
    capturedDialogProps = props;
    return <div data-testid="whiteboard-dialog" />;
  },
}));

vi.mock('../containers/WhiteboardActionsContainer', () => ({
  default: ({ children }: { children: (args: unknown) => React.ReactNode }) =>
    children({
      state: {},
      actions: {
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
        onChangeDisplayName: vi.fn(),
      },
    }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useWhiteboardLastUpdatedDateQuery: () => ({ data: undefined }),
}));

vi.mock('@/core/ui/fullscreen/useFullscreen', () => ({
  useFullscreen: () => ({ fullscreen: false, setFullscreen: vi.fn() }),
}));

vi.mock('@/core/ui/grid/constants', async importOriginal => {
  const actual = await importOriginal<typeof import('@/core/ui/grid/constants')>();
  return {
    ...actual,
    useScreenSize: () => ({ isSmallScreen: false }),
  };
});

vi.mock('../hooks/useWhiteboardGuestAccess', () => ({
  default: () => ({ enabled: false, canToggle: false, isUpdating: false, guestLink: '', hasError: false }),
}));

vi.mock('../utils/buildGuestShareUrl', () => ({
  buildGuestShareUrl: (id?: string) => `https://example.com/public/whiteboard/${id}`,
}));

vi.mock('@/domain/shared/components/ShareDialog/ShareButton', () => ({
  default: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../WhiteboardShareDialog/WhiteboardGuestAccessControls', () => ({
  default: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../WhiteboardShareDialog/WhiteboardGuestAccessSection', () => ({
  default: () => null,
}));

vi.mock('../../realTimeCollaboration/CollaborationSettings/CollaborationSettings', () => ({
  default: () => null,
}));

vi.mock('@/domain/collaboration/realTimeCollaboration/SaveRequestIndicatorIcon', () => ({
  SaveRequestIndicatorIcon: () => null,
}));

vi.mock('../WhiteboardPreviewSettings/WhiteboardPreviewSettingsButton', () => ({
  default: () => null,
}));

vi.mock('@/core/ui/button/FullscreenButton', () => ({
  default: () => null,
}));

// Mock useSpace — will be configured per-test
const mockMyMembershipStatus = vi.fn<() => CommunityMembershipStatus | undefined>();

vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({
    space: {
      about: {
        membership: {
          get myMembershipStatus() {
            return mockMyMembershipStatus();
          },
        },
      },
    },
  }),
}));

const createWhiteboard = (overrides: Partial<WhiteboardDetails> = {}): WhiteboardDetails => ({
  id: 'wb-1',
  nameID: 'wb-1',
  guestContributionsAllowed: false,
  profile: {
    id: 'profile-1',
    displayName: 'Test Whiteboard',
    storageBucket: { id: 'bucket-1', allowedMimeTypes: [], maxFileSize: 0 },
  },
  previewSettings: { zoom: 1, offsetX: 0, offsetY: 0 },
  ...overrides,
});

const defaultProps = {
  whiteboardId: 'wb-1',
  backToWhiteboards: vi.fn(),
  whiteboardShareUrl: 'https://example.com/whiteboard',
  loadingWhiteboards: false,
};

describe('WhiteboardView - forceReadOnly', () => {
  beforeEach(() => {
    capturedDialogProps = {};
    vi.clearAllMocks();
  });

  it('does not force read-only for a space member when guest access is enabled', () => {
    mockMyMembershipStatus.mockReturnValue(CommunityMembershipStatus.Member);

    render(
      <WhiteboardView
        {...defaultProps}
        whiteboard={createWhiteboard({ guestContributionsAllowed: true })}
        authorization={{ myPrivileges: [AuthorizationPrivilege.UpdateContent] }}
      />
    );

    const options = capturedDialogProps.options as { forceReadOnly?: boolean; canEdit?: boolean };
    expect(options.forceReadOnly).toBe(false);
    expect(options.canEdit).toBe(true);
  });

  it('forces read-only for a non-member when guest access is enabled', () => {
    mockMyMembershipStatus.mockReturnValue(CommunityMembershipStatus.NotMember);

    render(
      <WhiteboardView
        {...defaultProps}
        whiteboard={createWhiteboard({ guestContributionsAllowed: true })}
        authorization={{ myPrivileges: [AuthorizationPrivilege.UpdateContent] }}
      />
    );

    const options = capturedDialogProps.options as { forceReadOnly?: boolean; canEdit?: boolean };
    expect(options.forceReadOnly).toBe(true);
    expect(options.canEdit).toBe(true);
  });

  it('does not force read-only for a non-member when guest access is disabled', () => {
    mockMyMembershipStatus.mockReturnValue(CommunityMembershipStatus.NotMember);

    render(
      <WhiteboardView
        {...defaultProps}
        whiteboard={createWhiteboard({ guestContributionsAllowed: false })}
        authorization={{ myPrivileges: [AuthorizationPrivilege.UpdateContent] }}
      />
    );

    const options = capturedDialogProps.options as { forceReadOnly?: boolean; canEdit?: boolean };
    expect(options.forceReadOnly).toBe(false);
    expect(options.canEdit).toBe(true);
  });

  it('does not force read-only for a member when guest access is disabled', () => {
    mockMyMembershipStatus.mockReturnValue(CommunityMembershipStatus.Member);

    render(
      <WhiteboardView
        {...defaultProps}
        whiteboard={createWhiteboard({ guestContributionsAllowed: false })}
        authorization={{ myPrivileges: [AuthorizationPrivilege.UpdateContent] }}
      />
    );

    const options = capturedDialogProps.options as { forceReadOnly?: boolean; canEdit?: boolean };
    expect(options.forceReadOnly).toBe(false);
    expect(options.canEdit).toBe(true);
  });

  it('forces read-only when membership status is undefined and guest access is enabled', () => {
    mockMyMembershipStatus.mockReturnValue(undefined);

    render(
      <WhiteboardView
        {...defaultProps}
        whiteboard={createWhiteboard({ guestContributionsAllowed: true })}
        authorization={{ myPrivileges: [AuthorizationPrivilege.UpdateContent] }}
      />
    );

    const options = capturedDialogProps.options as { forceReadOnly?: boolean };
    expect(options.forceReadOnly).toBe(true);
  });

  it('sets canEdit to false when user lacks UpdateContent privilege', () => {
    mockMyMembershipStatus.mockReturnValue(CommunityMembershipStatus.Member);

    render(
      <WhiteboardView
        {...defaultProps}
        whiteboard={createWhiteboard({ guestContributionsAllowed: false })}
        authorization={{ myPrivileges: [AuthorizationPrivilege.Read] }}
      />
    );

    const options = capturedDialogProps.options as { forceReadOnly?: boolean; canEdit?: boolean };
    expect(options.forceReadOnly).toBe(false);
    expect(options.canEdit).toBe(false);
  });
});
