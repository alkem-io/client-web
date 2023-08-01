import { ReactNode, useMemo } from 'react';
import {
  usePendingMembershipsChallengeQuery,
  usePendingMembershipsOpportunityQuery,
  usePendingMembershipsQuery,
  usePendingMembershipsSpaceQuery,
  usePendingMembershipsUserQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import { JourneyTypeName, getJourneyTypeName } from '../../challenge/JourneyTypeName';
import { useUserContext } from '../contributor/user';
import { Visual } from '../../common/visual/Visual';
import { PendingMembershipsQuery } from '../../../core/apollo/generated/graphql-schema';

interface JourneyDetails {
  journeyTypeName: JourneyTypeName;
  journeyDisplayName: string;
  journeyTagline: string | undefined;
  journeyTags: string[] | undefined;
  journeyCardBanner: Visual | undefined;
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
  applications: PendingMembershipsQuery['me']['applications'] | undefined;
  invitations: PendingMembershipsQuery['me']['invitations'] | undefined;
  refetchPendingMemberships: () => void;
}

const VISIBLE_STATES = ['invited', 'new'];

export const usePendingMemberships = (): UsePendingMembershipsProvided => {
  const { user } = useUserContext();

  const { data, refetch: refetchPendingMemberships } = usePendingMembershipsQuery({
    skip: !user?.user.id,
  });

  const invitations = useMemo(
    () =>
      data?.me.invitations?.filter(({ state }) => {
        return VISIBLE_STATES.includes(state);
      }),
    [data]
  );

  const applications = useMemo(
    () =>
      data?.me.applications?.filter(({ state }) => {
        return VISIBLE_STATES.includes(state);
      }),
    [data]
  );

  return {
    invitations,
    applications,
    refetchPendingMemberships,
  };
};

interface InvitationHydratorProvided {
  invitation: InvitationWithMeta | undefined;
}

interface InvitationHydratorProps {
  invitation: NonNullable<PendingMembershipsQuery['me']['invitations']>[number];
  withJourneyDetails?: boolean;
  children: (provided: InvitationHydratorProvided) => ReactNode;
}

export const InvitationHydrator = ({ invitation, withJourneyDetails = false, children }: InvitationHydratorProps) => {
  const { data: spaceData } = usePendingMembershipsSpaceQuery({
    variables: {
      spaceId: invitation.spaceID,
      fetchDetails: withJourneyDetails,
    },
    skip: Boolean(invitation.challengeID || invitation.opportunityID),
  });

  const { data: challengeData } = usePendingMembershipsChallengeQuery({
    variables: {
      spaceId: invitation.spaceID,
      challengeId: invitation.challengeID!,
      fetchDetails: withJourneyDetails,
    },
    skip: !invitation.challengeID,
  });

  const { data: opportunityData } = usePendingMembershipsOpportunityQuery({
    variables: {
      spaceId: invitation.spaceID,
      opportunityId: invitation.opportunityID!,
      fetchDetails: withJourneyDetails,
    },
    skip: !invitation.opportunityID,
  });

  const journey = opportunityData?.space.opportunity ?? challengeData?.space.challenge ?? spaceData?.space;

  const { data: userData } = usePendingMembershipsUserQuery({
    variables: {
      userId: invitation.createdBy,
    },
  });

  const createdBy = userData?.usersById.find(user => user.id === invitation.createdBy);

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
      journeyTypeName: getJourneyTypeName({
        challengeNameId: invitation.challengeID,
        opportunityNameId: invitation.opportunityID,
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
  application: NonNullable<PendingMembershipsQuery['me']['applications']>[number];
  children: (provided: ApplicationHydratorProvided) => ReactNode;
}

export const ApplicationHydrator = ({ application, children }: ApplicationHydratorProps) => {
  const { data: spaceData } = usePendingMembershipsSpaceQuery({
    variables: {
      spaceId: application.spaceID,
      fetchDetails: true,
    },
    skip: Boolean(application.challengeID || application.opportunityID),
  });

  const { data: challengeData } = usePendingMembershipsChallengeQuery({
    variables: {
      spaceId: application.spaceID,
      challengeId: application.challengeID!,
      fetchDetails: true,
    },
    skip: !application.challengeID,
  });

  const { data: opportunityData } = usePendingMembershipsOpportunityQuery({
    variables: {
      spaceId: application.spaceID,
      opportunityId: application.opportunityID!,
      fetchDetails: true,
    },
    skip: !application.opportunityID,
  });

  const journey = opportunityData?.space.opportunity ?? challengeData?.space.challenge ?? spaceData?.space;

  const hydratedApplication = useMemo<ApplicationWithMeta | undefined>(() => {
    if (!application || !journey) {
      return undefined;
    }
    return {
      id: application.id,
      journeyDisplayName: journey.profile.displayName,
      journeyTypeName: getJourneyTypeName({
        challengeNameId: application.challengeID,
        opportunityNameId: application.opportunityID,
      }),
      journeyTagline: journey.profile.tagline,
      journeyTags: journey.profile.tagset?.tags,
      journeyCardBanner: journey.profile.cardBanner,
    };
  }, [application, journey]);

  return <>{children({ application: hydratedApplication })}</>;
};
