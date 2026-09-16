import type { DefaultContext } from '@apollo/client';
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
import { evictFromCache } from '@/core/apollo/utils/evictFromCache';
import type { ApplicationModel } from '../model/ApplicationModel';
import type { InvitationModel } from '../model/InvitationModel';
import type InvitationResultModel from '../model/InvitationResultModel';
import type { PlatformInvitationModel } from '../model/PlatformInvitationModel';

type useRoleSetApplicationsAndInvitationsParams = {
  roleSetId: string | undefined;
  /**
   * Whether to select `roleSet.applications`. The server gates that field on GRANT while
   * `invitations` only needs the invite privilege, so a caller that merely needs the
   * invitations (the invite dialog's dedupe) must opt out: for an inviter without GRANT the
   * non-null `applications` field would otherwise null out the whole `roleSet`. Defaults to
   * true — the admin pending tables read both.
   */
  includeApplications?: boolean;
  /**
   * Apollo link context attached to every mutation this hook runs — e.g.
   * `{ skipGlobalErrorHandler: true }` for a caller that renders every failure itself.
   */
  mutationContext?: DefaultContext;
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
    /** T013 — Suggested language for the invitee (FR-014/FR-015). Omit to leave absent. */
    suggestedLanguage?: string;
  }) => Promise<InvitationResultModel[]>;
  invitationStateChange: (invitationId: string, eventName: string) => Promise<unknown>;
  deleteInvitation: (invitationId: string) => Promise<unknown>;
  deletePlatformInvitation: (invitationId: string) => Promise<unknown>;
  refetch: () => Promise<unknown>;
  loading: boolean;
  errored: boolean;
  isApplying: boolean;
};

const getContributorType = (type: ActorType | undefined): ActorType => {
  return type ?? ActorType.User;
};

const useRoleSetApplicationsAndInvitations = ({
  roleSetId,
  includeApplications = true,
  mutationContext,
}: useRoleSetApplicationsAndInvitationsParams): useRoleSetApplicationsAndInvitationsProvided => {
  const [fetchActorDetails] = useActorDetailsLazyQuery();

  const {
    data,
    loading,
    error,
    refetch: refetchCommunityApplicationsInvitations,
  } = useCommunityApplicationsInvitationsQuery({
    // biome-ignore lint/style/noNonNullAssertion: guarded by skip
    variables: { roleSetId: roleSetId!, includeApplications },
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

  useEffect(() => {
    const appIds = data?.lookup.roleSet?.applications?.map(app => app.actor.id) ?? [];
    const invIds = data?.lookup.roleSet?.invitations.map(inv => inv.actor.id) ?? [];
    const contributorIds = [...new Set([...appIds, ...invIds])];

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
  }, [data, fetchActorDetails]);

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
        data?.lookup.roleSet?.applications?.map(app => ({
          ...app,
          contributorType: getContributorType(app.actor.type),
          actor: {
            ...app.actor,
            profile: app.actor.profile
              ? { ...app.actor.profile, email: getActorEmail(actorDetailsMap[app.actor.id]) }
              : undefined,
          },
          questions: app.questions,
          user: app.user,
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
      context: mutationContext,
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
      update: cache => {
        if (roleSetId) {
          evictFromCache(cache, roleSetId, 'RoleSet');
        }
      },
      context: mutationContext,
      onCompleted: () => refetch(),
    });

  const [invitationStateEvent] = useInvitationStateEventMutation();
  const handleInvitationStateChange = (invitationId: string, eventName: string) =>
    invitationStateEvent({
      variables: {
        invitationId,
        eventName,
      },
      context: mutationContext,
      onCompleted: () => refetch(),
    });

  const [deleteInvitation] = useDeleteInvitationMutation();
  const handleDeleteInvitation = (invitationId: string) =>
    deleteInvitation({
      variables: {
        invitationId,
      },
      context: mutationContext,
      onCompleted: () => refetch(),
    });

  const [deletePlatformInvitation] = useDeletePlatformInvitationMutation();
  const handleDeletePlatformInvitation = (invitationId: string) =>
    deletePlatformInvitation({
      variables: {
        invitationId,
      },
      context: mutationContext,
      onCompleted: () => refetch(),
    });

  const [inviteForEntryRoleOnRoleSet] = useInviteForEntryRoleOnRoleSetMutation();
  const handleInviteContributorsOnRoleSet = async ({
    roleSetId,
    invitedContributorIds,
    invitedUserEmails,
    welcomeMessage,
    extraRoles,
    suggestedLanguage,
  }: {
    roleSetId: string;
    invitedContributorIds: string[];
    invitedUserEmails: string[];
    welcomeMessage: string;
    extraRoles?: RoleName[];
    suggestedLanguage?: string;
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
        suggestedLanguage,
      },
      context: mutationContext,
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
    errored: !!error,
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
