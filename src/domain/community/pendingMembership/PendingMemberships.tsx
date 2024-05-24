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

export interface JourneyDetails {
  journeyTypeName: JourneyTypeName;
  journeyDisplayName: string;
  journeyTagline: string | undefined;
  journeyTags: string[] | undefined;
  journeyVisual: Visual | undefined;
  journeyUri: string | undefined;
}

export interface InvitationWithMeta extends JourneyDetails {
  id: string;
  userDisplayName: string | undefined;
  welcomeMessage: string | undefined;
  createdDate: Date | string;
}

interface ApplicationWithMeta extends JourneyDetails {
  id: string;
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

const getChildJourneyTypeName = ({ spaceLevel }: { spaceLevel: JourneyLevel }): JourneyTypeName =>
  ['space', 'subspace', 'subsubspace'][spaceLevel] as JourneyTypeName;

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
      spaceId: invitation.spaceID,
      fetchDetails: withJourneyDetails,
      fetchCommunityGuidelines: withCommunityGuidelines,
      visualType: invitation.spaceLevel === 0 && visualType === VisualType.Avatar ? VisualType.Card : visualType, // Spaces don't have avatars
    },
  });

  const journey = spaceData?.lookup.space;

  const { data: userData } = usePendingMembershipsUserQuery({
    variables: {
      userId: invitation.createdBy,
    },
  });

  const createdBy = userData?.user;

  const hydratedInvitation = useMemo<InvitationWithMeta | undefined>(() => {
    if (!invitation || !journey) {
      return undefined;
    }

    console.log(journey, getChildJourneyTypeName(invitation), invitation);

    return {
      id: invitation.id,
      welcomeMessage: invitation.welcomeMessage,
      createdDate: invitation.createdDate,
      userDisplayName: createdBy?.profile.displayName,
      journeyDisplayName: journey.profile.displayName,
      journeyTypeName: getChildJourneyTypeName(invitation),
      journeyUri: journey.profile.url,
      journeyTagline: journey.profile.tagline,
      journeyTags: journey.profile.tagset?.tags,
      journeyVisual: journey.profile.visual,
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
      spaceId: application.spaceID,
      fetchDetails: true,
      visualType: application.spaceLevel === 0 && visualType === VisualType.Avatar ? VisualType.Card : visualType, // Spaces don't have avatars
    },
  });

  const journey = spaceData?.lookup.space;

  const hydratedApplication = useMemo<ApplicationWithMeta | undefined>(() => {
    if (!application || !journey) {
      return undefined;
    }
    return {
      id: application.id,
      journeyDisplayName: journey.profile.displayName,
      journeyTypeName: getChildJourneyTypeName(application),
      journeyUri: journey.profile.url,
      journeyTagline: journey.profile.tagline,
      journeyTags: journey.profile.tagset?.tags,
      journeyVisual: journey.profile.visual,
    };
  }, [application, journey]);

  return <>{children({ application: hydratedApplication })}</>;
};
