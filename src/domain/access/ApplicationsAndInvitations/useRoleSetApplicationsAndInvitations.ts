import {
  refetchUserPendingMembershipsQuery,
  useApplyForEntryRoleOnRoleSetMutation,
  useCommunityApplicationsInvitationsQuery,
  useDeleteInvitationMutation,
  useDeletePlatformInvitationMutation,
  useEventOnApplicationMutation,
  useInvitationStateEventMutation,
  useInviteContributorsEntryRoleOnRoleSetMutation,
  useInviteUserToPlatformAndRoleSetMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, RoleName, RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { useMemo } from 'react';
import { ApplicationProvided } from '../model/ApplicationModel';
import { InvitationProvided } from '../model/InvitationModel';
import { PlatformInvitationProvided } from '../model/PlatformInvitationModel';

export interface InviteUserData {
  message: string;
  extraRole?: RoleName;
}

export interface InviteContributorsData extends InviteUserData {
  contributorIds: string[];
}

export interface InviteExternalUserData extends InviteUserData {
  email: string;
}

type useRoleSetApplicationsAndInvitationsParams = {
  roleSetId: string;
};

type useRoleSetApplicationsAndInvitationsProvided = {
  applications: ApplicationProvided[];
  invitations: InvitationProvided[];
  platformInvitations: PlatformInvitationProvided[];
  authorizationPrivileges: AuthorizationPrivilege[];
  applyForEntryRoleOnRoleSet: (
    roleSetId: string,
    questions: { name: string; value: string; sortOrder: number }[]
  ) => Promise<unknown>;
  applicationStateChange: (roleSetId: string, eventName: string) => Promise<unknown>;
  inviteContributorOnRoleSet: (inviteData: {
    roleSetId: string;
    contributorIds: string[];
    message: string;
    extraRole?: RoleName;
  }) => Promise<unknown>;
  inviteContributorOnPlatformRoleSet: (inviteData: {
    roleSetId: string;
    email: string;
    message: string;
    extraRole?: RoleName;
  }) => Promise<unknown>;
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
      // TODO: Sentry logging?
      console.error('Unknown contributor type', typename);
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

  const [inviteContributorsEntryRoleOnRoleSet] = useInviteContributorsEntryRoleOnRoleSetMutation();
  const handleInviteContributorOnRoleSet = async ({
    roleSetId,
    contributorIds,
    message,
    extraRole,
  }: {
    roleSetId: string;
    contributorIds: string[];
    message: string;
    extraRole?: RoleName;
  }) => {
    const role = extraRole === RoleName.Member ? undefined : extraRole;

    await inviteContributorsEntryRoleOnRoleSet({
      variables: {
        roleSetId,
        contributorIds,
        message,
        extraRole: role,
      },
      onCompleted: () => refetch(),
    });
  };

  const [inviteUserForRoleSetAndPlatform] = useInviteUserToPlatformAndRoleSetMutation();
  const handleInviteContributorOnPlatformRoleSet = async ({
    roleSetId,
    email,
    message,
    extraRole,
  }: {
    roleSetId: string;
    email: string;
    message: string;
    extraRole?: RoleName;
  }) => {
    const role = extraRole === RoleName.Member ? undefined : extraRole;

    await inviteUserForRoleSetAndPlatform({
      variables: {
        roleSetId,
        email,
        message,
        extraRole: role,
      },
      onCompleted: () => refetch(),
    });
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
    inviteContributorOnRoleSet: handleInviteContributorOnRoleSet,
    inviteContributorOnPlatformRoleSet: handleInviteContributorOnPlatformRoleSet,
    invitationStateChange: handleInvitationStateChange,
    deleteInvitation: handleDeleteInvitation,
    deletePlatformInvitation: handleDeletePlatformInvitation,
    isApplying,
  };
};

export default useRoleSetApplicationsAndInvitations;
