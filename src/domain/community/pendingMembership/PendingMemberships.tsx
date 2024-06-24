import { ReactNode, useMemo } from 'react';
import {
  usePendingMembershipsSpaceQuery,
  usePendingMembershipsUserQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import { JourneyTypeName } from '../../journey/JourneyTypeName';
import { PendingApplication, useUserContext } from '../user';
import { Visual } from '../../common/visual/Visual';
import { InvitationItem } from '../user/providers/UserProvider/InvitationItem';
import { CommunityGuidelinesSummaryFragment, VisualType } from '../../../core/apollo/generated/graphql-schema';
import { JourneyLevel } from '../../../main/routing/resolvers/RouteResolver';
import { Identifiable } from '../../../core/utils/Identifiable';

export interface JourneyDetails {
  profile: {
    displayName: string;
    tagline: string;
    url: string;
    tagset?: {
      tags: string[];
    };
    visual?: Visual | undefined;
  };
  level: JourneyLevel;
}

export interface InvitationWithMeta extends Omit<InvitationItem, 'space'> {
  userDisplayName: string | undefined;
  space: JourneyDetails;
}

interface ApplicationWithMeta extends Identifiable {
  space: JourneyDetails;
}

interface UsePendingMembershipsProvided {
  applications: PendingApplication[] | undefined;
  invitations: InvitationItem[] | undefined;
}

export const usePendingMemberships = (): UsePendingMembershipsProvided => {
  const { user } = useUserContext();

  return {
    invitations: user?.pendingInvitations,
    applications: user?.pendingApplications,
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

export const getChildJourneyTypeName = ({ level }: { level: JourneyLevel }): JourneyTypeName =>
  ['space', 'subspace', 'subsubspace'][level] as JourneyTypeName;

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
      spaceId: invitation.space.id,
      fetchDetails: withJourneyDetails,
      fetchCommunityGuidelines: withCommunityGuidelines,
      visualType: invitation.space.level === 0 && visualType === VisualType.Avatar ? VisualType.Card : visualType, // Spaces don't have avatars
    },
  });

  const journey = spaceData?.lookup.space;

  const { data: userData } = usePendingMembershipsUserQuery({
    variables: {
      userId: invitation.invitation.createdBy.id,
    },
  });

  const createdBy = userData?.user;

  const hydratedInvitation = useMemo<InvitationWithMeta | undefined>(() => {
    if (!invitation) {
      return undefined;
    }

    return {
      ...invitation,
      userDisplayName: createdBy?.profile.displayName,
      space: {
        ...invitation.space,
        ...journey,
        profile: {
          ...invitation.space.profile,
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
      spaceId: application.space.id,
      fetchDetails: true,
      visualType: application.space.level === 0 && visualType === VisualType.Avatar ? VisualType.Card : visualType, // Spaces don't have avatars
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
        ...application.space,
        ...journey,
        profile: {
          ...application.space.profile,
          ...journey?.profile,
        },
      },
    };
  }, [application, journey]);

  return <>{children({ application: hydratedApplication })}</>;
};
