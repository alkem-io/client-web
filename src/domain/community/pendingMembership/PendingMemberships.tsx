import { ReactNode, useMemo } from 'react';
import {
  usePendingMembershipsSpaceQuery,
  usePendingMembershipsUserQuery,
  useSpacePrivilegesQuery,
  useUserPendingMembershipsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { PendingApplication } from '../user';
import { InvitationItem } from '../user/providers/UserProvider/InvitationItem';
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
  about: SpaceAboutLightModel;
  level: SpaceLevel;
}

export interface InvitationWithMeta extends Omit<InvitationItem, 'space'> {
  userDisplayName: string | undefined;
  space: SpaceDetails;
}

interface ApplicationWithMeta extends Identifiable {
  space: SpaceDetails;
}

interface UsePendingMembershipsProvided {
  applications: PendingApplication[] | undefined;
  invitations: InvitationItem[] | undefined;
}

type PendingMembershipsProps = {
  skip: boolean;
};

export const usePendingMemberships = ({ skip = false }: PendingMembershipsProps): UsePendingMembershipsProvided => {
  const { isAuthenticated } = useAuthenticationContext();
  const { data } = useUserPendingMembershipsQuery({
    skip: !isAuthenticated || skip,
  });

  return {
    invitations: data?.me.communityInvitations,
    applications: data?.me.communityApplications,
  };
};

interface InvitationHydratorProvided {
  invitation: InvitationWithMeta | undefined;
  communityGuidelines?: CommunityGuidelinesSummaryFragment;
}

type InvitationHydratorProps = {
  invitation: InvitationItem;
  children: (provided: InvitationHydratorProvided) => ReactNode;
  withCommunityGuidelines?: boolean;
} & (
  | {
      withJourneyDetails?: false;
    }
  | {
      withJourneyDetails: true;
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

  const journey = spaceData?.lookup.space;

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
        ...journey,
        level: invitation.spacePendingMembershipInfo.level,
        about: {
          ...invitation.spacePendingMembershipInfo.about,
          ...journey?.about,
        },
      },
    };
  }, [invitation, journey, userDisplayName]);

  const communityGuidelines = journey?.about.guidelines;

  return <>{children({ invitation: hydratedInvitation, communityGuidelines })}</>;
};

interface ApplicationHydratorProvided {
  application: ApplicationWithMeta | undefined;
}

interface ApplicationHydratorProps {
  application: PendingApplication;
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

  const journey = spaceData?.lookup.space;

  const hydratedApplication = useMemo<ApplicationWithMeta | undefined>(() => {
    if (!application) {
      return undefined;
    }
    return {
      ...application,
      space: {
        ...application.spacePendingMembershipInfo,
        ...journey,
        level: application.spacePendingMembershipInfo.level,
        about: {
          ...application.spacePendingMembershipInfo.about,
          ...journey?.about,
        },
      },
    };
  }, [application, journey]);

  return <>{children({ application: hydratedApplication })}</>;
};
