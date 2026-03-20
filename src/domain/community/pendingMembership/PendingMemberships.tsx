import { useMemo } from 'react';
import {
  usePendingMembershipsSpaceQuery,
  usePendingMembershipsUserQuery,
  useSpacePrivilegesQuery,
  useUserPendingMembershipsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  type CommunityGuidelinesSummaryFragment,
  type SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import type { PendingApplicationItem } from '../user/models/PendingApplicationItem';
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

export interface ApplicationWithMeta extends Identifiable {
  space: SpaceDetails;
}

interface UsePendingMembershipsProvided {
  applications: PendingApplicationItem[] | undefined;
  invitations: PendingInvitationItem[] | undefined;
  loading: boolean;
  refetch: () => void;
}

type PendingMembershipsProps = {
  skip: boolean;
};

export const usePendingMemberships = ({ skip = false }: PendingMembershipsProps): UsePendingMembershipsProvided => {
  const { isAuthenticated } = useAuthenticationContext();
  const { data, loading, refetch } = useUserPendingMembershipsQuery({
    skip: !isAuthenticated || skip,
  });

  return {
    invitations: data?.me.communityInvitations,
    applications: data?.me.communityApplications,
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

  const hydratedInvitation = useMemo<InvitationWithMeta | undefined>(() => {
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
  }, [invitation, space, userDisplayName]);

  const communityGuidelines = space?.about.guidelines;

  return { invitation: hydratedInvitation, communityGuidelines };
};

interface UseApplicationHydratorResult {
  application: ApplicationWithMeta | undefined;
}

export const useApplicationHydrator = (
  application: PendingApplicationItem | undefined
): UseApplicationHydratorResult => {
  const spaceId = application?.spacePendingMembershipInfo.id ?? '';

  const { data: spacePrivileges } = useSpacePrivilegesQuery({
    variables: { spaceId },
    skip: !application,
  });
  const hasReadAboutPrivilege = spacePrivileges?.lookup.space?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.ReadAbout
  );
  const { data: spaceData } = usePendingMembershipsSpaceQuery({
    variables: { spaceId },
    skip: !application || !hasReadAboutPrivilege,
  });

  const space = spaceData?.lookup.space;

  const hydratedApplication = useMemo<ApplicationWithMeta | undefined>(() => {
    if (!application) {
      return undefined;
    }
    return {
      ...application,
      space: {
        ...application.spacePendingMembershipInfo,
        ...space,
        level: application.spacePendingMembershipInfo.level,
        about: {
          ...application.spacePendingMembershipInfo.about,
          ...space?.about,
        },
      },
    };
  }, [application, space]);

  return { application: hydratedApplication };
};
