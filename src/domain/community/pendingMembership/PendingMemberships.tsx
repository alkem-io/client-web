import { ReactNode, useMemo } from 'react';
import {
  usePendingMembershipsChallengeQuery,
  usePendingMembershipsOpportunityQuery,
  usePendingMembershipsSpaceQuery,
  usePendingMembershipsUserQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import { JourneyTypeName } from '../../journey/JourneyTypeName';
import { useUserContext } from '../user';
import { Visual } from '../../common/visual/Visual';
import { ContributionItem } from '../user/contribution';
import { InvitationItem } from '../user/providers/UserProvider/InvitationItem';
import { JourneyLocation } from '../../../main/routing/urlBuilders';
import { VisualType } from '../../../core/apollo/generated/graphql-schema';

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
  applications: ContributionItem[] | undefined;
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
}

type InvitationHydratorProps = {
  invitation: InvitationItem;
  children: (provided: InvitationHydratorProvided) => ReactNode;
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

type ChildJourneyLocation = Pick<JourneyLocation, 'challengeNameId' | 'opportunityNameId'>;

const getChildJourneyTypeName = (journeyLocation: ChildJourneyLocation): JourneyTypeName => {
  if (journeyLocation.opportunityNameId) {
    return 'opportunity';
  }
  if (journeyLocation.challengeNameId) {
    return 'challenge';
  }
  return 'space';
};

export const InvitationHydrator = ({
  invitation,
  withJourneyDetails = false,
  // This fallback is for Typescript only,
  // visualType is either required when withJourneyDetails is true or not used otherwise.
  visualType = VisualType.Avatar,
  children,
}: InvitationHydratorProps) => {
  const { data: spaceData } = usePendingMembershipsSpaceQuery({
    variables: {
      spaceId: invitation.spaceId,
      fetchDetails: withJourneyDetails,
      visualType: visualType === VisualType.Avatar ? VisualType.Card : visualType, // Spaces don't have avatars
    },
    skip: Boolean(invitation.challengeId || invitation.opportunityId),
  });

  const { data: challengeData } = usePendingMembershipsChallengeQuery({
    variables: {
      challengeId: invitation.challengeId!,
      fetchDetails: withJourneyDetails,
      visualType,
    },
    skip: !invitation.challengeId,
  });

  const { data: opportunityData } = usePendingMembershipsOpportunityQuery({
    variables: {
      opportunityId: invitation.opportunityId!,
      fetchDetails: withJourneyDetails,
      visualType,
    },
    skip: !invitation.opportunityId,
  });

  const journey = opportunityData?.lookup.opportunity ?? challengeData?.lookup.challenge ?? spaceData?.space;

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
    return {
      id: invitation.id,
      welcomeMessage: invitation.welcomeMessage,
      createdDate: invitation.createdDate,
      userDisplayName: createdBy?.profile.displayName,
      journeyDisplayName: journey.profile.displayName,
      journeyTypeName: getChildJourneyTypeName({
        challengeNameId: invitation.challengeId,
        opportunityNameId: invitation.opportunityId,
      }),
      journeyUri: journey.profile.url,
      journeyTagline: journey.profile.tagline,
      journeyTags: journey.profile.tagset?.tags,
      journeyVisual: journey.profile.visual,
    };
  }, [invitation, journey, createdBy]);

  return <>{children({ invitation: hydratedInvitation })}</>;
};

interface ApplicationHydratorProvided {
  application: ApplicationWithMeta | undefined;
}

interface ApplicationHydratorProps {
  application: ContributionItem;
  visualType: VisualType;
  children: (provided: ApplicationHydratorProvided) => ReactNode;
}

export const ApplicationHydrator = ({ application, visualType, children }: ApplicationHydratorProps) => {
  const { data: spaceData } = usePendingMembershipsSpaceQuery({
    variables: {
      spaceId: application.spaceId,
      fetchDetails: true,
      visualType: visualType === VisualType.Avatar ? VisualType.Card : visualType, // Spaces don't have avatars
    },
    skip: Boolean(application.challengeId || application.opportunityId),
  });

  const { data: challengeData } = usePendingMembershipsChallengeQuery({
    variables: {
      challengeId: application.challengeId!,
      fetchDetails: true,
      visualType,
    },
    skip: !application.challengeId,
  });

  const { data: opportunityData } = usePendingMembershipsOpportunityQuery({
    variables: {
      opportunityId: application.opportunityId!,
      fetchDetails: true,
      visualType,
    },
    skip: !application.opportunityId,
  });

  const journey = opportunityData?.lookup.opportunity ?? challengeData?.lookup.challenge ?? spaceData?.space;

  const hydratedApplication = useMemo<ApplicationWithMeta | undefined>(() => {
    if (!application || !journey) {
      return undefined;
    }
    return {
      id: application.id,
      journeyDisplayName: journey.profile.displayName,
      journeyTypeName: getChildJourneyTypeName({
        challengeNameId: application.challengeId,
        opportunityNameId: application.opportunityId,
      }),
      journeyUri: journey.profile.url,
      journeyTagline: journey.profile.tagline,
      journeyTags: journey.profile.tagset?.tags,
      journeyVisual: journey.profile.visual,
    };
  }, [application, journey, spaceData, challengeData, opportunityData]);

  return <>{children({ application: hydratedApplication })}</>;
};
