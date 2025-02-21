import { ReactNode, useMemo } from 'react';
import {
  usePendingMembershipsSpaceQuery,
  usePendingMembershipsUserQuery,
  useUserPendingMembershipsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { PendingApplication } from '../user';
import { Visual } from '@/domain/common/visual/Visual';
import { InvitationItem } from '../user/providers/UserProvider/InvitationItem';
import { CommunityGuidelinesSummaryFragment, SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';

export interface SpaceDetails {
  profile: {
    displayName: string;
    tagline?: string;
    url: string;
    tagset?: {
      tags: string[];
    };
    visual?: Visual | undefined;
  };
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
      visualType?: VisualType;
    }
  | {
      withJourneyDetails: true;
      visualType: VisualType;
    }
);

export const InvitationHydrator = ({
  invitation,
  withJourneyDetails = false,
  // This fallback is for Typescript only,
  // visualType is either required when withJourneyDetails is true or not used otherwise.
  visualType = VisualType.Avatar,
  withCommunityGuidelines = false,
  children,
}: InvitationHydratorProps) => {
  const { data: spaceData } = usePendingMembershipsSpaceQuery({
    variables: {
      spaceId: invitation.spacePendingMembershipInfo.id,
      fetchDetails: withJourneyDetails,
      fetchCommunityGuidelines: withCommunityGuidelines,
      visualType:
        invitation.spacePendingMembershipInfo.level === SpaceLevel.L0 && visualType === VisualType.Avatar
          ? VisualType.Card
          : visualType, // Spaces don't have avatars
    },
  });

  const journey = spaceData?.lookup.space;

  const { data: userData } = usePendingMembershipsUserQuery({
    variables: {
      userId: invitation.invitation.createdBy.id,
    },
  });

  const createdBy = userData?.lookup.user;

  const hydratedInvitation = useMemo<InvitationWithMeta | undefined>(() => {
    if (!invitation) {
      return undefined;
    }

    return {
      ...invitation,
      userDisplayName: createdBy?.profile.displayName,
      space: {
        ...invitation.spacePendingMembershipInfo,
        ...journey,
        level: invitation.spacePendingMembershipInfo.level,
        profile: {
          ...invitation.spacePendingMembershipInfo.profile,
          ...journey?.profile,
        },
      },
    };
  }, [invitation, journey, createdBy]);

  const communityGuidelines = journey?.community?.guidelines;

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

export const ApplicationHydrator = ({ application, visualType, children }: ApplicationHydratorProps) => {
  const { data: spaceData } = usePendingMembershipsSpaceQuery({
    variables: {
      spaceId: application.spacePendingMembershipInfo.id,
      fetchDetails: true,
      visualType:
        application.spacePendingMembershipInfo.level === SpaceLevel.L0 && visualType === VisualType.Avatar
          ? VisualType.Card
          : visualType, // Spaces don't have avatars
    },
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
        profile: {
          ...application.spacePendingMembershipInfo.profile,
          ...journey?.profile,
        },
      },
    };
  }, [application, journey]);

  return <>{children({ application: hydratedApplication })}</>;
};
