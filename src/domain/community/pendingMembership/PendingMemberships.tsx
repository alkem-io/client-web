import {
  usePendingMembershipsSpaceQuery,
  usePendingMembershipsUserQuery,
  useSpacePrivilegesQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  type CommunityGuidelinesSummaryFragment,
  type SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';
import { useV2PendingMembershipsQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import type { V2PendingMembershipRequestFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { useReportedQueryError } from '@/core/apollo/hooks/useReportedQueryError';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import type { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import type { PendingInvitationItem } from '../user/models/PendingInvitationItem';

export interface SpaceDetails {
  id: string;
  about: SpaceAboutLightModel;
  level: SpaceLevel;
}

export interface InvitationWithMeta extends Omit<PendingInvitationItem, 'space'> {
  userDisplayName: string | undefined;
  space: SpaceDetails;
}

export type PendingMembershipRequest = V2PendingMembershipRequestFragment;

interface UsePendingMembershipsProvided {
  /** Space invitations this viewer may act on: their own and those addressed to their organizations and VCs. */
  invitations: PendingMembershipRequest[] | undefined;
  /** The viewer's own pending Space applications. */
  applications: PendingMembershipRequest[] | undefined;
  /** The user's own pending organization invitations (062) — never mixed into `invitations`, which stays Space-only. */
  orgInvitations: PendingMembershipRequest[] | undefined;
  /** The user's own pending organization applications (062) — never mixed into `applications`, which stays Space-only. */
  orgApplications: PendingMembershipRequest[] | undefined;
  loading: boolean;
  refetch: () => void;
}

type PendingMembershipsProps = {
  skip: boolean;
};

const ofResource = (requests: PendingMembershipRequest[] | undefined, entityType: string) =>
  requests?.filter(request => request.resource.entityType === entityType);

/**
 * Viewer.pendingInvitations / Viewer.pendingApplications (screens-dispositions.tsv:10985-10986, :17683): one
 * MembershipRequest list each, split by the requested resource's entity type into the Space and organization sections.
 */
export const usePendingMemberships = ({ skip = false }: PendingMembershipsProps): UsePendingMembershipsProvided => {
  const { isAuthenticated } = useCurrentUserContext();
  const { data, loading, error, refetch } = useV2PendingMembershipsQuery({
    skip: !isAuthenticated || skip,
  });
  useReportedQueryError(error);

  return {
    invitations: ofResource(data?.viewer.pendingInvitations, 'space'),
    applications: ofResource(data?.viewer.pendingApplications, 'space'),
    orgInvitations: ofResource(data?.viewer.pendingInvitations, 'organization'),
    orgApplications: ofResource(data?.viewer.pendingApplications, 'organization'),
    loading,
    refetch,
  };
};

interface UseInvitationHydratorResult {
  invitation: InvitationWithMeta | undefined;
  communityGuidelines?: CommunityGuidelinesSummaryFragment;
}

export const useInvitationHydrator = (
  invitation: PendingInvitationItem | undefined,
  { withCommunityGuidelines = false } = {}
): UseInvitationHydratorResult => {
  const spaceId = invitation?.spacePendingMembershipInfo.id ?? '';

  const { data: spacePrivileges } = useSpacePrivilegesQuery({
    variables: { spaceId },
    skip: !invitation,
  });
  const hasReadAboutPrivilege = spacePrivileges?.lookup.space?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.ReadAbout
  );
  const { data: spaceData } = usePendingMembershipsSpaceQuery({
    variables: {
      spaceId,
      includeCommunityGuidelines: withCommunityGuidelines,
    },
    skip: !invitation || !hasReadAboutPrivilege,
  });

  const space = spaceData?.lookup.space;

  const userId = invitation?.invitation.createdBy?.id;

  const { data: userData } = usePendingMembershipsUserQuery({
    variables: { userId: userId! },
    skip: !userId,
  });

  const userDisplayName = userData?.lookup.user?.profile?.displayName ?? 'This user no longer exists on the platform!';

  const hydratedInvitation = (() => {
    if (!invitation) {
      return undefined;
    }

    return {
      ...invitation,
      userDisplayName,
      space: {
        ...invitation.spacePendingMembershipInfo,
        ...space,
        level: invitation.spacePendingMembershipInfo.level,
        about: {
          ...invitation.spacePendingMembershipInfo.about,
          ...space?.about,
        },
      },
    };
  })();

  const communityGuidelines = space?.about.guidelines;

  return { invitation: hydratedInvitation, communityGuidelines };
};
