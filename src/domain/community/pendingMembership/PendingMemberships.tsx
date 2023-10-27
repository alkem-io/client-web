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
import { buildJourneyUrl, JourneyLocation } from '../../../main/routing/urlBuilders';

interface JourneyDetails {
  journeyTypeName: JourneyTypeName;
  journeyDisplayName: string;
  journeyTagline: string | undefined;
  journeyTags: string[] | undefined;
  journeyCardBanner: Visual | undefined;
  journeyUri: string | undefined;
}

export interface InvitationWithMeta extends JourneyDetails {
  id: string;
  userDisplayName: string;
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

interface InvitationHydratorProps {
  invitation: InvitationItem;
  withJourneyDetails?: boolean;
  children: (provided: InvitationHydratorProvided) => ReactNode;
}

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

export const InvitationHydrator = ({ invitation, withJourneyDetails = false, children }: InvitationHydratorProps) => {
  const { data: spaceData } = usePendingMembershipsSpaceQuery({
    variables: {
      spaceId: invitation.spaceId,
      fetchDetails: withJourneyDetails,
    },
    skip: Boolean(invitation.challengeId || invitation.opportunityId),
  });

  const { data: challengeData } = usePendingMembershipsChallengeQuery({
    variables: {
      spaceId: invitation.spaceId,
      challengeId: invitation.challengeId!,
      fetchDetails: withJourneyDetails,
    },
    skip: !invitation.challengeId,
  });

  const { data: opportunityData } = usePendingMembershipsOpportunityQuery({
    variables: {
      spaceId: invitation.spaceId,
      opportunityId: invitation.opportunityId!,
      fetchDetails: withJourneyDetails,
    },
    skip: !invitation.opportunityId,
  });

  const journey = opportunityData?.space.opportunity ?? challengeData?.space.challenge ?? spaceData?.space;

  const { data: userData } = usePendingMembershipsUserQuery({
    variables: {
      userId: invitation.createdBy,
    },
  });

  const createdBy = userData?.users.find(user => user.id === invitation.createdBy);

  const hydratedInvitation = useMemo<InvitationWithMeta | undefined>(() => {
    if (!invitation || !journey || !createdBy) {
      return undefined;
    }
    return {
      id: invitation.id,
      welcomeMessage: invitation.welcomeMessage,
      createdDate: invitation.createdDate,
      userDisplayName: createdBy.profile.displayName,
      journeyDisplayName: journey.profile.displayName,
      journeyTypeName: getChildJourneyTypeName({
        challengeNameId: invitation.challengeId,
        opportunityNameId: invitation.opportunityId,
      }),
      journeyUri: buildJourneyUrl({
        spaceNameId: spaceData?.space.nameID ?? challengeData?.space.nameID ?? opportunityData?.space.nameID ?? '',
        challengeNameId: challengeData?.space.challenge.nameID ?? opportunityData?.space.opportunity.parentNameID,
        opportunityNameId: opportunityData?.space.opportunity.nameID,
      }),
      journeyTagline: journey.profile.tagline,
      journeyTags: journey.profile.tagset?.tags,
      journeyCardBanner: journey.profile.cardBanner,
    };
  }, [invitation, journey, createdBy]);

  return <>{children({ invitation: hydratedInvitation })}</>;
};

interface ApplicationHydratorProvided {
  application: ApplicationWithMeta | undefined;
}

interface ApplicationHydratorProps {
  application: ContributionItem;
  children: (provided: ApplicationHydratorProvided) => ReactNode;
}

export const ApplicationHydrator = ({ application, children }: ApplicationHydratorProps) => {
  const { data: spaceData } = usePendingMembershipsSpaceQuery({
    variables: {
      spaceId: application.spaceId,
      fetchDetails: true,
    },
    skip: Boolean(application.challengeId || application.opportunityId),
  });

  const { data: challengeData } = usePendingMembershipsChallengeQuery({
    variables: {
      spaceId: application.spaceId,
      challengeId: application.challengeId!,
      fetchDetails: true,
    },
    skip: !application.challengeId,
  });

  const { data: opportunityData } = usePendingMembershipsOpportunityQuery({
    variables: {
      spaceId: application.spaceId,
      opportunityId: application.opportunityId!,
      fetchDetails: true,
    },
    skip: !application.opportunityId,
  });

  const journey = opportunityData?.space.opportunity ?? challengeData?.space.challenge ?? spaceData?.space;

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
      journeyUri: buildJourneyUrl({
        spaceNameId: spaceData?.space.nameID ?? challengeData?.space.nameID ?? opportunityData?.space.nameID ?? '',
        challengeNameId: challengeData?.space.challenge.nameID ?? opportunityData?.space.opportunity.parentNameID,
        opportunityNameId: opportunityData?.space.opportunity.nameID,
      }),
      journeyTagline: journey.profile.tagline,
      journeyTags: journey.profile.tagset?.tags,
      journeyCardBanner: journey.profile.cardBanner,
    };
  }, [application, journey, spaceData, challengeData, opportunityData]);

  return <>{children({ application: hydratedApplication })}</>;
};
