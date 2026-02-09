import { ReactNode, useMemo } from 'react';
import {
  usePendingMembershipsSpaceQuery,
  usePendingMembershipsUserQuery,
  useSpacePrivilegesQuery,
  useUserPendingMembershipsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { PendingInvitationItem } from '../user/models/PendingInvitationItem';
import { PendingApplicationItem } from '../user/models/PendingApplicationItem';
import {
  AuthorizationPrivilege,
  CommunityGuidelinesSummaryFragment,
  SpaceLevel,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';

export interface SpaceDetails {
  id: string;
  about: SpaceAboutLightModel;
  level: SpaceLevel;
}

export interface InvitationWithMeta extends Omit<PendingInvitationItem, 'space'> {
  userDisplayName: string | undefined;
  space: SpaceDetails;
}

interface ApplicationWithMeta extends Identifiable {
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

interface InvitationHydratorProvided {
  invitation: InvitationWithMeta | undefined;
  communityGuidelines?: CommunityGuidelinesSummaryFragment;
}

type InvitationHydratorProps = {
  invitation: PendingInvitationItem;
  children: (provided: InvitationHydratorProvided) => ReactNode;
  withCommunityGuidelines?: boolean;
} & (
  | {
      withSpaceDetails?: false;
    }
  | {
      withSpaceDetails: true;
    }
);

export const InvitationHydrator = ({
  invitation,

  withCommunityGuidelines = false,
  children,
}: InvitationHydratorProps) => {
  const { data: spacePrivileges } = useSpacePrivilegesQuery({
    variables: {
      spaceId: invitation.spacePendingMembershipInfo.id,
    },
  });
  const hasReadAboutPrivilege = spacePrivileges?.lookup.space?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.ReadAbout
  );
  const { data: spaceData } = usePendingMembershipsSpaceQuery({
    variables: {
      spaceId: invitation.spacePendingMembershipInfo.id,
      includeCommunityGuidelines: withCommunityGuidelines,
    },
    skip: !hasReadAboutPrivilege,
  });

  const space = spaceData?.lookup.space;

  const userId = invitation.invitation.createdBy?.id;

  const { data: userData } = usePendingMembershipsUserQuery({
    variables: { userId: userId! },
    skip: !userId,
  });

  const userDisplayName = userData?.lookup.user?.profile.displayName ?? 'This user no longer exists on the platform!';

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

  return <>{children({ invitation: hydratedInvitation, communityGuidelines })}</>;
};

interface ApplicationHydratorProvided {
  application: ApplicationWithMeta | undefined;
}

interface ApplicationHydratorProps {
  application: PendingApplicationItem;
  visualType: VisualType;
  children: (provided: ApplicationHydratorProvided) => ReactNode;
}

export const ApplicationHydrator = ({ application, children }: ApplicationHydratorProps) => {
  const { data: spacePrivileges } = useSpacePrivilegesQuery({
    variables: {
      spaceId: application.spacePendingMembershipInfo.id,
    },
  });
  const hasReadAboutPrivilege = spacePrivileges?.lookup.space?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.ReadAbout
  );
  const { data: spaceData } = usePendingMembershipsSpaceQuery({
    variables: {
      spaceId: application.spacePendingMembershipInfo.id,
    },
    skip: !hasReadAboutPrivilege,
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

  return <>{children({ application: hydratedApplication })}</>;
};
