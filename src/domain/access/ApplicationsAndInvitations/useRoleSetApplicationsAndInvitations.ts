import { ApolloError, type DefaultContext } from '@apollo/client';
import { useEffect, useState } from 'react';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import {
  useMembershipRequestsQuery,
  useResendMembershipInvitationMutation,
  useRespondToMembershipRequestMutation,
} from '@/core/apollo/generated-v2/apollo-hooks';
import {
  type MembershipRequestRowFragment,
  RequestDirection,
  RequestState,
} from '@/core/apollo/generated-v2/graphql-schema';
import { RoleName } from '@/core/apollo/generated-v2/legacy-vocabulary';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import type { ApplicationModel } from '../model/ApplicationModel';
import type { InvitationModel } from '../model/InvitationModel';
import type { PlatformInvitationModel } from '../model/PlatformInvitationModel';

type useRoleSetApplicationsAndInvitationsParams = {
  /**
   * The request resource: the space (or organization) id. Natively a role set has no id of its own — membership
   * requests are parented on their resource (community-roles-screens.tsv "wrapper-ids" → Space.id).
   */
  roleSetId: string | undefined;
  /** Whether to list applications (inbound requests). Defaults to true — the admin pending tables read both. */
  includeApplications?: boolean;
  /**
   * `{ skipGlobalErrorHandler: true }` for a caller that renders every failure itself; otherwise each failed request
   * is shown through `useApolloErrorHandler` (the native client has no global error link).
   */
  mutationContext?: DefaultContext;
};

type useRoleSetApplicationsAndInvitationsProvided = {
  applications: ApplicationModel[];
  invitations: InvitationModel[];
  platformInvitations: PlatformInvitationModel[];
  /** Sends a lifecycle event (APPROVE, REJECT, ARCHIVE, …) to an application. */
  applicationStateChange: (applicationId: string, eventName: string) => Promise<unknown>;
  /** Sends a lifecycle event (REJECT, ARCHIVE, …) to an invitation. */
  invitationStateChange: (invitationId: string, eventName: string) => Promise<unknown>;
  /** Revokes an open invitation: CANCEL (B2.6). */
  deleteInvitation: (invitationId: string) => Promise<unknown>;
  /** Revokes an open email invitation: CANCEL (B2.6). */
  deletePlatformInvitation: (invitationId: string) => Promise<unknown>;
  /** Sends the invitation email of an open email invitation again; the caller renders the outcome. */
  resendPlatformInvitation: (invitationId: string) => Promise<unknown>;
  refetch: () => Promise<unknown>;
  loading: boolean;
  errored: boolean;
};

/** Revoking an open invitation or email invitation is the CANCEL lifecycle event (H-community-roles-2, B2.6). */
export const REQUEST_CANCEL_EVENT = 'CANCEL';
const PAGE_SIZE = 100;
/** Every read a request's state change can alter: the list itself and, on approval, the roster. */
const REQUEST_REFETCH = ['MembershipRequests', 'SpaceCommunityMembers', 'SpaceCommunityAdmin'];

/** `Actor.actorType` (the actor's entity type) in the vocabulary of the pending tables. */
const ACTOR_TYPE: Record<string, ActorType> = {
  user: ActorType.User,
  organization: ActorType.Organization,
  virtual_contributor: ActorType.VirtualContributor,
};

const ROLE_NAMES = new Set<string>(Object.values(RoleName));
/** The roles an invitation offers beyond the always-granted member role. */
export const extraRoles = (roles: readonly string[]): RoleName[] =>
  roles.filter((role): role is RoleName => role !== RoleName.Member && ROLE_NAMES.has(role));

type Answer = { question?: string; value?: string; sort_order?: number };
/** `answers` is the frozen submission; rendered by sort_order, then question and value (surface.graphql membership). */
export const toQuestions = (answers: unknown): NonNullable<ApplicationModel['questions']> =>
  (Array.isArray(answers) ? (answers as Answer[]) : [])
    .map(answer => ({ question: answer.question ?? '', value: answer.value ?? '', sortOrder: answer.sort_order ?? 0 }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.question.localeCompare(b.question) || a.value.localeCompare(b.value))
    .map((answer, index) => ({ id: String(index), name: answer.question, value: answer.value }));

/** The lifecycle state of the request (RequestState is derived from the lifecycle rows, which are lower case). */
const lifecycleState = (state: RequestState | null | undefined) => state?.toLowerCase() ?? '';

const toActor = (request: MembershipRequestRowFragment) => {
  const actor = request.actor;
  return {
    id: actor?.id ?? '',
    profile: actor?.about
      ? {
          id: actor.id,
          displayName: actor.about.displayName,
          email: request.email ?? undefined,
          url: actor.url ?? '',
          avatar: actor.about.avatar ? { uri: actor.about.avatar.file.url } : undefined,
        }
      : undefined,
  };
};

const useRoleSetApplicationsAndInvitations = ({
  roleSetId,
  includeApplications = true,
  mutationContext,
}: useRoleSetApplicationsAndInvitationsParams): useRoleSetApplicationsAndInvitationsProvided => {
  const resource = roleSetId ?? '';
  const skip = !resource;
  const handleError = useApolloErrorHandler();
  const ownErrorHandling = mutationContext?.skipGlobalErrorHandler === true;

  // pending-requests (community-roles-screens.tsv:178): every page of Query.requests (A5.17: the client pages to the end).
  const { data, loading, error, refetch, fetchMore } = useMembershipRequestsQuery({
    variables: { resource, first: PAGE_SIZE },
    skip,
  });
  const connection = skip ? undefined : data?.requests;
  const nextCursor = connection?.pageInfo.hasNextPage ? (connection.pageInfo.endCursor ?? '') : undefined;
  const [pagingError, setPagingError] = useState<{ resource: string; error: Error }>();
  useEffect(() => {
    if (skip || nextCursor === undefined) return;
    if (!nextCursor) {
      setPagingError({ resource, error: new Error('Requests continuation is missing its cursor') });
      return;
    }
    fetchMore({
      variables: { resource, first: PAGE_SIZE, after: nextCursor },
      updateQuery: (previous, { fetchMoreResult }) => ({
        requests: {
          ...fetchMoreResult.requests,
          edges: [...previous.requests.edges, ...fetchMoreResult.requests.edges],
        },
      }),
    })
      .then(({ data: page }) => {
        const { hasNextPage, endCursor } = page.requests.pageInfo;
        if (hasNextPage && (!endCursor || endCursor === nextCursor)) {
          setPagingError({ resource, error: new Error('Requests continuation did not advance its cursor') });
        }
      })
      .catch((cause: unknown) =>
        setPagingError({ resource, error: cause instanceof Error ? cause : new Error('Requests continuation failed') })
      );
  }, [skip, resource, nextCursor]);
  const pagingFailed = pagingError !== undefined && pagingError.resource === resource;

  const requests = (connection?.edges ?? []).map(edge => edge.node);

  const applications: ApplicationModel[] = includeApplications
    ? requests
        .filter(request => request.direction === RequestDirection.Inbound)
        .map(request => {
          const actorType = request.actor ? ACTOR_TYPE[request.actor.actorType] : undefined;
          return {
            id: request.id,
            createdDate: new Date(request.createdAt),
            // A9.25: the request's last change is its decision, else its creation.
            updatedDate: new Date(request.decidedAt ?? request.createdAt),
            state: lifecycleState(request.state),
            nextEvents: request.availableEvents,
            contributorType: actorType ?? ActorType.User,
            actor: toActor(request),
            questions: toQuestions(request.answers),
            user:
              request.actor && actorType === ActorType.User && request.email
                ? { id: request.actor.id, email: request.email }
                : null,
          };
        })
    : [];

  const outbound = requests.filter(request => request.direction === RequestDirection.Outbound);

  const invitations: InvitationModel[] = outbound
    .filter(request => request.actor)
    .map(request => ({
      id: request.id,
      createdDate: new Date(request.createdAt),
      updatedDate: new Date(request.decidedAt ?? request.createdAt),
      state: lifecycleState(request.state),
      nextEvents: request.availableEvents,
      contributorType: (request.actor && ACTOR_TYPE[request.actor.actorType]) ?? ActorType.User,
      extraRoles: extraRoles(request.roles),
      actor: toActor(request),
    }));

  // An email invitation has no actor until it is claimed; only an open one is pending.
  const platformInvitations: PlatformInvitationModel[] = outbound
    .filter(request => !request.actor && request.email && request.state === RequestState.Invited)
    .map(request => ({
      id: request.id,
      createdDate: new Date(request.createdAt),
      email: request.email ?? '',
      roleSetExtraRoles: extraRoles(request.roles),
    }));

  const failed = (cause: unknown): never => {
    if (!ownErrorHandling && cause instanceof ApolloError) handleError(cause);
    throw cause;
  };

  // respond-application :182, revoke-pending :183 (Mutation.respondToRequest).
  const [respondToRequest] = useRespondToMembershipRequestMutation({
    refetchQueries: REQUEST_REFETCH,
    awaitRefetchQueries: true,
  });
  const respond = (id: string, event: string) => respondToRequest({ variables: { id, event } }).catch(failed);

  // resend-invitation :181. The request is unchanged by a resend, so nothing is re-read.
  const [resendInvitation] = useResendMembershipInvitationMutation();

  return {
    applications,
    invitations,
    platformInvitations,
    refetch: () => (skip ? Promise.resolve() : refetch()),
    loading: !skip && (loading || (nextCursor !== undefined && !pagingFailed)),
    errored: !skip && (!!error || pagingFailed),
    applicationStateChange: respond,
    invitationStateChange: respond,
    deleteInvitation: id => respond(id, REQUEST_CANCEL_EVENT),
    deletePlatformInvitation: id => respond(id, REQUEST_CANCEL_EVENT),
    resendPlatformInvitation: id => resendInvitation({ variables: { id } }),
  };
};

export default useRoleSetApplicationsAndInvitations;
