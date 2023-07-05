import { ReactNode, useMemo } from 'react';
import {
  usePendingMembershipsChallengeQuery,
  usePendingMembershipsOpportunityQuery,
  usePendingMembershipsQuery,
  usePendingMembershipsSpaceQuery,
  usePendingMembershipsUserQuery
} from '../../../core/apollo/generated/apollo-hooks';
import { JourneyTypeName } from '../../challenge/JourneyTypeName';
import { PendingMembershipsQuery } from '../../../core/apollo/generated/graphql-schema';
import { useUserContext } from '../contributor/user';

export interface InvitationWithMeta {
  id: string;
  journeyTypeName: JourneyTypeName;
  userDisplayName: string;
  journeyDisplayName: string;
  welcomeMessage: string | undefined;
}

interface ApplicationWithMeta {
  id: string;
  journeyTypeName: JourneyTypeName;
  journeyDisplayName: string;
  journeyDescription: string | undefined;
  journeyTags: string[] | undefined;
  journeyBannerUri: string | undefined;
}

interface UsePendingMembershipsProvided {
  applications: PendingMembershipsQuery['rolesUser']['applications'];
  invitations: PendingMembershipsQuery['rolesUser']['invitations'];
}

// const mapInvitation = (invitation: PendingMembershipInvitationFragment, journey: { profile: PendingMembershipsJourneyProfileFragment }, createdBy: { profile: { displayName: string } }, journeyTypeName: JourneyTypeName): InvitationWithMeta => {
//   return {
//     id: invitation.id,
//     welcomeMessage: invitation.welcomeMessage,
//     userDisplayName: createdBy.profile.displayName,
//     journeyDisplayName: journey.profile.displayName,
//     journeyTypeName,
//   };
// };

const usePendingMemberships = (): UsePendingMembershipsProvided => {
  const { user } = useUserContext();

  const { data } = usePendingMembershipsQuery({
    variables: {
      userId: user?.user.id!,
    },
    skip: !user?.user.id,
  });

  return {
    invitations: data?.rolesUser.invitations,
    applications: data?.rolesUser.applications,
  };
  //
  // const spaceInvitations = useMemo<InvitationWithMeta[] | undefined>(() => data?.spaces.flatMap(space => {
  //   return space.community?.invitations?.map(invitation => (
  //     mapInvitation(invitation, space, 'space')
  //   )) ?? [];
  // }), [data]);
  //
  // const challengeInvitations = useMemo<InvitationWithMeta[] | undefined>(() => data?.spaces.flatMap(space => {
  //   return space.challenges?.flatMap(challenge => challenge.community?.invitations?.map(invitation => (
  //     mapInvitation(invitation, challenge, 'challenge')
  //   )) ?? []) ?? [];
  // }), [data]);
  //
  // const opportunityInvitations = useMemo<InvitationWithMeta[] | undefined>(() => data?.spaces.flatMap(space => {
  //   return space.opportunities?.flatMap(opportunity => opportunity.community?.invitations?.map(invitation => (
  //     mapInvitation(invitation, opportunity, 'opportunity')
  //   )) ?? []) ?? [];
  // }), [data]);
  //
  // const spaceApplications = useMemo<ApplicationWithMeta[] | undefined>(() => data?.spaces.flatMap(space => {
  //   return space.community?.applications?.map(invitation => ({
  //     ...invitation,
  //     journeyTypeName: 'space',
  //   })) ?? [];
  // }), [data]);
  //
  // const challengeApplications = useMemo<ApplicationWithMeta[] | undefined>(() => data?.spaces.flatMap(space => {
  //   return space.challenges?.flatMap(challenge => challenge.community?.applications?.map(invitation => ({
  //     ...invitation,
  //     journeyTypeName: 'challenge',
  //   })) ?? []) ?? [];
  // }), [data]);
  //
  // const opportunityApplications = useMemo<ApplicationWithMeta[] | undefined>(() => data?.spaces.flatMap(space => {
  //   return space.opportunities?.flatMap(opportunity => opportunity.community?.applications?.map(invitation => ({
  //     ...invitation,
  //     journeyTypeName: 'opportunity',
  //   })) ?? []) ?? [];
  // }), [data]);
  //
  // const invitations = useMemo(() => [...spaceInvitations ?? [], ...challengeInvitations ?? [], ...opportunityInvitations ?? []], [spaceInvitations, challengeInvitations, opportunityInvitations]);
  //
  // const applications = useMemo(() => [...spaceApplications ?? [], ...challengeApplications ?? [], ...opportunityApplications ?? []], [spaceApplications, challengeApplications, opportunityApplications]);
  //
  // return {
  //   invitations,
  //   applications,
  // };
};

interface InvitationHydratorProvided {
  invitation: InvitationWithMeta | undefined;
}

interface InvitationHydratorProps {
  invitation: NonNullable<PendingMembershipsQuery['rolesUser']['invitations']>[number];
  children: (provided: InvitationHydratorProvided) => ReactNode;
}

const getJourneyTypeName = ({ challengeID, opportunityID }: { challengeID?: string, opportunityID?: string }): JourneyTypeName => {
  if (opportunityID) {
    return 'opportunity'
  }
  if (challengeID) {
    return 'challenge';
  }
  return 'space';
};

export const InvitationHydrator = ({ invitation, children }: InvitationHydratorProps) => {
  const { data: spaceData } = usePendingMembershipsSpaceQuery({
    variables: {
      spaceId: invitation.spaceID,
    },
    skip: Boolean(invitation.challengeID || invitation.opportunityID),
  });

  const { data: challengeData } = usePendingMembershipsChallengeQuery({
    variables: {
      spaceId: invitation.spaceID,
      challengeId: invitation.challengeID!,
    },
    skip: !invitation.challengeID,
  });

  const { data: opportunityData } = usePendingMembershipsOpportunityQuery({
    variables: {
      spaceId: invitation.spaceID,
      opportunityId: invitation.opportunityID!,
    },
    skip: !invitation.opportunityID,
  });

  const journey =
    opportunityData?.space.opportunity ??
    challengeData?.space.challenge ??
    spaceData?.space;

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
      userDisplayName: createdBy.profile.displayName,
      journeyDisplayName: journey.profile.displayName,
      journeyTypeName: getJourneyTypeName(invitation),
    }
  }, [invitation, journey, createdBy]);

  return (
    <>
      {children({ invitation: hydratedInvitation })}
    </>
  );
};

interface ApplicationHydratorProvided {
  application: ApplicationWithMeta | undefined;
}

interface ApplicationHydratorProps {
  application: NonNullable<PendingMembershipsQuery['rolesUser']['applications']>[number];
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

  const journey =
    opportunityData?.space.opportunity ??
    challengeData?.space.challenge ??
    spaceData?.space;

  const hydratedInvitation = useMemo<ApplicationWithMeta | undefined>(() => {
    if (!application || !journey) {
      return undefined;
    }
    return {
      id: application.id,
      journeyDisplayName: journey.profile.displayName,
      journeyTypeName: getJourneyTypeName(application),
      journeyDescription: journey.profile.description,
      journeyTags: journey.profile.tagset?.tags,
      journeyBannerUri: journey.profile.banner?.uri,
    }
  }, [application, journey]);

  return (
    <>
      {children({ application: hydratedInvitation })}
    </>
  );
};

export default usePendingMemberships;