import { useMemo } from 'react';
import { usePendingMembershipsQuery } from '../../../core/apollo/generated/apollo-hooks';
import { JourneyTypeName } from '../../challenge/JourneyTypeName';

export interface InvitationWithMeta {
  id: string;
  journeyTypeName: JourneyTypeName;
}

interface ApplicationWithMeta {
  id: string;
  journeyTypeName: JourneyTypeName;
}

interface UsePendingMembershipsProvided {
  applications: ApplicationWithMeta[] | undefined;
  invitations: InvitationWithMeta[] | undefined;
}

const usePendingMemberships = (): UsePendingMembershipsProvided => {
  const { data } = usePendingMembershipsQuery();

  const spaceInvitations = useMemo<InvitationWithMeta[] | undefined>(() => data?.spaces.flatMap(space => {
    return space.community?.invitations?.map(invitation => ({
      ...invitation,
      journeyTypeName: 'space',
    })) ?? [];
  }), [data]);

  const challengeInvitations = useMemo<InvitationWithMeta[] | undefined>(() => data?.spaces.flatMap(space => {
    return space.challenges?.flatMap(challenge => challenge.community?.invitations?.map(invitation => ({
      ...invitation,
      journeyTypeName: 'challenge',
    })) ?? []) ?? [];
  }), [data]);

  const opportunityInvitations = useMemo<InvitationWithMeta[] | undefined>(() => data?.spaces.flatMap(space => {
    return space.opportunities?.flatMap(opportunity => opportunity.community?.invitations?.map(invitation => ({
      ...invitation,
      journeyTypeName: 'opportunity',
    })) ?? []) ?? [];
  }), [data]);

  const spaceApplications = useMemo<ApplicationWithMeta[] | undefined>(() => data?.spaces.flatMap(space => {
    return space.community?.applications?.map(invitation => ({
      ...invitation,
      journeyTypeName: 'space',
    })) ?? [];
  }), [data]);

  const challengeApplications = useMemo<ApplicationWithMeta[] | undefined>(() => data?.spaces.flatMap(space => {
    return space.challenges?.flatMap(challenge => challenge.community?.applications?.map(invitation => ({
      ...invitation,
      journeyTypeName: 'challenge',
    })) ?? []) ?? [];
  }), [data]);

  const opportunityApplications = useMemo<ApplicationWithMeta[] | undefined>(() => data?.spaces.flatMap(space => {
    return space.opportunities?.flatMap(opportunity => opportunity.community?.applications?.map(invitation => ({
      ...invitation,
      journeyTypeName: 'opportunity',
    })) ?? []) ?? [];
  }), [data]);

  const invitations = useMemo(() => [...spaceInvitations ?? [], ...challengeInvitations ?? [], ...opportunityInvitations ?? []], [spaceInvitations, challengeInvitations, opportunityInvitations]);

  const applications = useMemo(() => [...spaceApplications ?? [], ...challengeApplications ?? [], ...opportunityApplications ?? []], [spaceApplications, challengeApplications, opportunityApplications]);

  return {
    invitations,
    applications,
  };
};

export default usePendingMemberships;