import type { ElementType } from 'react';
import type { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import type { PendingInvitationItem } from '@/domain/community/user/models/PendingInvitationItem';

export interface ApplicationButtonProps {
  spaceId: string | undefined;
  spaceLevel: SpaceLevel | undefined;
  isAuthenticated: boolean;
  isMember: boolean;
  isParentMember: boolean;
  applicationState: string | undefined;
  userInvitation: PendingInvitationItem | undefined;
  parentApplicationState: string | undefined;
  applyUrl: string | undefined;
  parentUrl: string | undefined;
  parentCommunityName: string | undefined;
  parentCommunitySpaceLevel: SpaceLevel | undefined;
  subspaceName: string | undefined;
  canJoinCommunity: boolean;
  canAcceptInvitation: boolean;
  canApplyToCommunity: boolean;
  canJoinParentCommunity: boolean;
  canApplyToParentCommunity: boolean;
  onJoin: () => void;
  loading: boolean;
  component?: ElementType;
  extended?: boolean;
  onUpdateInvitation?: () => void | Promise<void>;
  noAuthApplyButtonText?: string;
}
