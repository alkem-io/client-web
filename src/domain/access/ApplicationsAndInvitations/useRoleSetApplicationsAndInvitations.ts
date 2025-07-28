import {
  refetchUserPendingMembershipsQuery,
  useApplyForEntryRoleOnRoleSetMutation,
  useCommunityApplicationsInvitationsQuery,
  useDeleteInvitationMutation,
  useDeletePlatformInvitationMutation,
  useEventOnApplicationMutation,
  useInvitationStateEventMutation,
  useInviteForEntryRoleOnRoleSetMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, RoleName, RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { useMemo } from 'react';
import { ApplicationModel } from '../model/ApplicationModel';
import { InvitationModel } from '../model/InvitationModel';
import { PlatformInvitationModel } from '../model/PlatformInvitationModel';
import InvitationResultModel from '../model/InvitationResultModel';

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
    extraRole?: RoleName;
  }) => Promise<InvitationResultModel[]>;
  invitationStateChange: (invitationId: string, eventName: string) => Promise<unknown>;
  deleteInvitation: (invitationId: string) => Promise<unknown>;
  deletePlatformInvitation: (invitationId: string) => Promise<unknown>;
  refetch: () => Promise<unknown>;
  loading: boolean;
  isApplying: boolean;
};

const addContributorType = (
  typename: 'User' | 'Organization' | 'VirtualContributor' | undefined
): RoleSetContributorType => {
  switch (typename) {
    case 'User':
      return RoleSetContributorType.User;
    case 'Organization':
      return RoleSetContributorType.Organization;
    case 'VirtualContributor':
      return RoleSetContributorType.Virtual;
    default: {
      return RoleSetContributorType.User;
    }
  }
};

const useRoleSetApplicationsAndInvitations = ({
  roleSetId,
}: useRoleSetApplicationsAndInvitationsParams): useRoleSetApplicationsAndInvitationsProvided => {
  const {
    data,
    loading,
    refetch: refetchCommunityApplicationsInvitations,
  } = useCommunityApplicationsInvitationsQuery({
    variables: { roleSetId: roleSetId! },
    skip: !roleSetId,
  });

  const refetch = async () => {
    if (roleSetId) {
      await refetchCommunityApplicationsInvitations();
      await refetchUserPendingMembershipsQuery();
    }
  };

  const { applications, invitations, platformInvitations } = useMemo(() => {
    return {
      applications:
        data?.lookup.roleSet?.applications.map(app => ({
          ...app,
          contributorType: addContributorType(app.contributor.__typename),
        })) ?? [],
      invitations:
        data?.lookup.roleSet?.invitations.map(inv => ({
          ...inv,
          contributorType: addContributorType(inv.contributor.__typename),
        })) ?? [],
      platformInvitations: data?.lookup.roleSet?.platformInvitations ?? [],
    };
  }, [data]);

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
    extraRole,
  }: {
    roleSetId: string;
    invitedContributorIds: string[];
    invitedUserEmails: string[];
    welcomeMessage: string;
    extraRole?: RoleName;
  }) => {
    const role = extraRole === RoleName.Member ? undefined : extraRole;

    let extraRoles: RoleName[] = [];
    if (role) {
      extraRoles = [role];
    }
    const result = await inviteForEntryRoleOnRoleSet({
      variables: {
        roleSetId,
        invitedContributorIds,
        invitedUserEmails,
        welcomeMessage,
        extraRoles,
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
