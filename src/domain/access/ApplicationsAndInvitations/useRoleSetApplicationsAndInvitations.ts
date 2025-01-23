import {
  useApplyForEntryRoleOnRoleSetMutation,
  useCommunityApplicationsInvitationsQuery,
  useDeleteInvitationMutation,
  useDeletePlatformInvitationMutation,
  useEventOnApplicationMutation,
  useInvitationStateEventMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { useMemo } from 'react';

type ApplicationProvided = {
  id: string;
  createdDate: Date;
  updatedDate: Date;
  state: string;
  nextEvents: Array<string>;
  contributorType: RoleSetContributorType;
  contributor: {
    id: string;
    profile: {
      displayName: string;
      email?: string;
      url: string;
      avatar?: {
        id: string;
        uri: string;
        name: string;
      };
      location?: {
        id: string;
        city?: string | undefined;
        country?: string | undefined;
      };
    };
  };
  questions: {
    id: string;
    name: string;
    value: string;
  }[];
};

type InvitationProvided = {
  id: string;
  createdDate: Date;
  updatedDate: Date;
  state: string;
  nextEvents: string[];
  contributorType: RoleSetContributorType;
  contributor: {
    id: string;
    profile: {
      id: string;
      displayName: string;
      email?: string;
      url: string;
      avatar?: {
        id: string;
        uri: string;
      };
      location?: {
        city?: string | undefined;
        country?: string | undefined;
      };
    };
  };
};

type PlatformInvitationProvided = {
  id: string;
  createdDate?: Date;
  email: string;
};

type useRoleSetApplicationsAndInvitationsParams = {
  roleSetId?: string;
};

type useRoleSetApplicationsAndInvitationsProvided = {
  applications: ApplicationProvided[];
  invitations: InvitationProvided[];
  platformInvitations: PlatformInvitationProvided[];
  applyForEntryRoleOnRoleSet: (
    roleSetId: string,
    questions: { name: string; value: string; sortOrder: number }[]
  ) => Promise<unknown>;
  applicationStateChange: (roleSetId: string, eventName: string) => Promise<unknown>;
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
  const { data, loading, refetch } = useCommunityApplicationsInvitationsQuery({
    variables: { roleSetId: roleSetId! },
    skip: !roleSetId,
  });

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

  const [sendInvitationStateEvent] = useInvitationStateEventMutation();
  const handleInvitationStateChange = (invitationId: string, eventName: string) =>
    sendInvitationStateEvent({
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

  return {
    applications,
    invitations,
    platformInvitations,
    refetch,
    loading,
    applyForEntryRoleOnRoleSet: handleApplyForEntryRoleOnRoleSet,
    applicationStateChange: handleApplicationStateChange,
    invitationStateChange: handleInvitationStateChange,
    deleteInvitation: handleDeleteInvitation,
    deletePlatformInvitation: handleDeletePlatformInvitation,
    isApplying,
  };
};

export default useRoleSetApplicationsAndInvitations;
