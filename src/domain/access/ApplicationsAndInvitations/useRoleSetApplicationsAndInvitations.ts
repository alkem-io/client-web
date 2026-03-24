import { useEffect, useState } from 'react';
import {
  refetchUserPendingMembershipsQuery,
  useActorDetailsLazyQuery,
  useApplyForEntryRoleOnRoleSetMutation,
  useCommunityApplicationsInvitationsQuery,
  useDeleteInvitationMutation,
  useDeletePlatformInvitationMutation,
  useEventOnApplicationMutation,
  useInvitationStateEventMutation,
  useInviteForEntryRoleOnRoleSetMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  type ActorDetailsQuery,
  ActorType,
  type AuthorizationPrivilege,
  RoleName,
} from '@/core/apollo/generated/graphql-schema';
import type { ApplicationModel } from '../model/ApplicationModel';
import type { InvitationModel } from '../model/InvitationModel';
import type InvitationResultModel from '../model/InvitationResultModel';
import type { PlatformInvitationModel } from '../model/PlatformInvitationModel';

type useRoleSetApplicationsAndInvitationsParams = {
  roleSetId: string | undefined;
};

type useRoleSetApplicationsAndInvitationsProvided = {
  applications: ApplicationModel[];
  invitations: InvitationModel[];
  platformInvitations: PlatformInvitationModel[];
  authorizationPrivileges: AuthorizationPrivilege[];
  applyForEntryRoleOnRoleSet: (
    roleSetId: string,
    questions: { name: string; value: string; sortOrder: number }[]
  ) => Promise<unknown>;
  applicationStateChange: (applicationId: string, eventName: string) => Promise<unknown>;
  inviteContributorsOnRoleSet: (inviteData: {
    roleSetId: string;
    invitedContributorIds: string[];
    invitedUserEmails: string[];
    welcomeMessage: string;
    extraRoles?: RoleName[];
  }) => Promise<InvitationResultModel[]>;
  invitationStateChange: (invitationId: string, eventName: string) => Promise<unknown>;
  deleteInvitation: (invitationId: string) => Promise<unknown>;
  deletePlatformInvitation: (invitationId: string) => Promise<unknown>;
  refetch: () => Promise<unknown>;
  loading: boolean;
  isApplying: boolean;
};

const getContributorType = (type: ActorType | undefined): ActorType => {
  return type ?? ActorType.User;
};

const useRoleSetApplicationsAndInvitations = ({
  roleSetId,
}: useRoleSetApplicationsAndInvitationsParams): useRoleSetApplicationsAndInvitationsProvided => {
  const [fetchActorDetails] = useActorDetailsLazyQuery();

  const {
    data,
    loading,
    refetch: refetchCommunityApplicationsInvitations,
  } = useCommunityApplicationsInvitationsQuery({
    // biome-ignore lint/style/noNonNullAssertion: guarded by skip
    variables: { roleSetId: roleSetId! },
    skip: !roleSetId,
  });

  const refetch = async () => {
    if (roleSetId) {
      await refetchCommunityApplicationsInvitations();
      await refetchUserPendingMembershipsQuery();
    }
  };

  // Fetch actor-specific details for application/invitation contributors
  type ActorDetail = NonNullable<ActorDetailsQuery['actor']>;
  const [actorDetailsMap, setActorDetailsMap] = useState<Record<string, ActorDetail>>({});

  const contributorIds = (() => {
    const appIds = data?.lookup.roleSet?.applications.map(app => app.actor.id) ?? [];
    const invIds = data?.lookup.roleSet?.invitations.map(inv => inv.actor.id) ?? [];
    return [...new Set([...appIds, ...invIds])];
  })();

  useEffect(() => {
    if (contributorIds.length === 0) {
      return;
    }

    const fetchAll = async () => {
      const results = await Promise.all(contributorIds.map(actorId => fetchActorDetails({ variables: { actorId } })));
      const newMap: Record<string, ActorDetail> = {};
      for (const result of results) {
        const actor = result.data?.actor;
        if (actor) {
          newMap[actor.id] = actor;
        }
      }
      setActorDetailsMap(newMap);
    };
    fetchAll();
  }, [contributorIds, fetchActorDetails]);

  const getActorEmail = (actorDetail: ActorDetail | undefined): string | undefined => {
    if (!actorDetail) return undefined;
    if (actorDetail.type === ActorType.User && 'email' in actorDetail) return actorDetail.email;
    if (actorDetail.type === ActorType.Organization && 'contactEmail' in actorDetail)
      return actorDetail.contactEmail ?? undefined;
    return undefined;
  };

  const { applications, invitations, platformInvitations } = (() => {
    return {
      applications:
        data?.lookup.roleSet?.applications.map(app => ({
          ...app,
          contributorType: getContributorType(app.actor.type),
          actor: {
            ...app.actor,
            profile: app.actor.profile
              ? { ...app.actor.profile, email: getActorEmail(actorDetailsMap[app.actor.id]) }
              : undefined,
          },
        })) ?? [],
      invitations:
        data?.lookup.roleSet?.invitations.map(inv => ({
          ...inv,
          contributorType: getContributorType(inv.actor.type),
          actor: {
            ...inv.actor,
            profile: inv.actor.profile
              ? { ...inv.actor.profile, email: getActorEmail(actorDetailsMap[inv.actor.id]) }
              : undefined,
          },
        })) ?? [],
      platformInvitations: data?.lookup.roleSet?.platformInvitations ?? [],
    };
  })();

  const [applyForEntryRoleOnRoleSet, { loading: isApplying }] = useApplyForEntryRoleOnRoleSetMutation();
  const handleApplyForEntryRoleOnRoleSet = (
    roleSetId: string,
    questions: { name: string; sortOrder: number; value: string }[]
  ) =>
    applyForEntryRoleOnRoleSet({
      variables: {
        roleSetId,
        questions,
      },
      onCompleted: () => refetch(),
    });

  const [eventOnApplication] = useEventOnApplicationMutation();
  const handleApplicationStateChange = (applicationId: string, newState: string) =>
    eventOnApplication({
      variables: {
        input: {
          applicationID: applicationId,
          eventName: newState,
        },
      },
      onCompleted: () => refetch(),
    });

  const [invitationStateEvent] = useInvitationStateEventMutation();
  const handleInvitationStateChange = (invitationId: string, eventName: string) =>
    invitationStateEvent({
      variables: {
        invitationId,
        eventName,
      },
      onCompleted: () => refetch(),
    });

  const [deleteInvitation] = useDeleteInvitationMutation();
  const handleDeleteInvitation = (invitationId: string) =>
    deleteInvitation({
      variables: {
        invitationId,
      },
      onCompleted: () => refetch(),
    });

  const [deletePlatformInvitation] = useDeletePlatformInvitationMutation();
  const handleDeletePlatformInvitation = (invitationId: string) =>
    deletePlatformInvitation({
      variables: {
        invitationId,
      },
      onCompleted: () => refetch(),
    });

  const [inviteForEntryRoleOnRoleSet] = useInviteForEntryRoleOnRoleSetMutation();
  const handleInviteContributorsOnRoleSet = async ({
    roleSetId,
    invitedContributorIds,
    invitedUserEmails,
    welcomeMessage,
    extraRoles,
  }: {
    roleSetId: string;
    invitedContributorIds: string[];
    invitedUserEmails: string[];
    welcomeMessage: string;
    extraRoles?: RoleName[];
  }) => {
    // Filter out the Member role as it's not an extra role
    const filteredExtraRoles = (extraRoles ?? []).filter(role => role !== RoleName.Member);

    const result = await inviteForEntryRoleOnRoleSet({
      variables: {
        roleSetId,
        invitedActorIds: invitedContributorIds,
        invitedUserEmails,
        welcomeMessage,
        extraRoles: filteredExtraRoles,
      },
      onCompleted: () => refetch(),
    });
    return result.data?.inviteForEntryRoleOnRoleSet ?? [];
  };

  return {
    applications,
    invitations,
    platformInvitations,
    authorizationPrivileges: data?.lookup.roleSet?.authorization?.myPrivileges ?? [],
    refetch,
    loading,
    applyForEntryRoleOnRoleSet: handleApplyForEntryRoleOnRoleSet,
    applicationStateChange: handleApplicationStateChange,
    inviteContributorsOnRoleSet: handleInviteContributorsOnRoleSet,
    invitationStateChange: handleInvitationStateChange,
    deleteInvitation: handleDeleteInvitation,
    deletePlatformInvitation: handleDeletePlatformInvitation,
    isApplying,
  };
};

export default useRoleSetApplicationsAndInvitations;
