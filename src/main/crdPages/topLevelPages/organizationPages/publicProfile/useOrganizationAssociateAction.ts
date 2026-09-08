import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useJoinRoleSetMutation, useUserPendingMembershipsQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  CommunityMembershipStatus,
  OrganizationAssociateEligibilityReason,
  type OrgPendingInvitationDataFragment,
} from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { AssociateActionKind } from '@/crd/components/organization/OrganizationAssociateAction';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';

/**
 * Maps the server-computed eligibility signal + the role set's own membership status
 * to the profile hero's single action state. `myAssociateEligibility.reason` already
 * carries the full precedence order (spec data-model.md §2), so the switch below is a
 * direct restatement of it; `membershipStatus` is consulted FIRST as the more literal,
 * live signal for "already answered" states, purely as a defensive backstop — the two
 * are never expected to disagree (D7/D15: the action is driven only by these two server
 * signals, never by a client-side privilege check).
 */
export const mapEligibilityToAction = (
  reason: OrganizationAssociateEligibilityReason | undefined,
  membershipStatus: CommunityMembershipStatus | undefined
): AssociateActionKind => {
  if (membershipStatus === CommunityMembershipStatus.Member) return 'none';
  if (membershipStatus === CommunityMembershipStatus.InvitationPending) return 'respond';
  if (membershipStatus === CommunityMembershipStatus.ApplicationPending) return 'pending-application';

  switch (reason) {
    case OrganizationAssociateEligibilityReason.NotAuthenticated:
      return 'login';
    case OrganizationAssociateEligibilityReason.AlreadyAssociate:
      return 'none';
    case OrganizationAssociateEligibilityReason.InvitationPending:
      return 'respond';
    case OrganizationAssociateEligibilityReason.ApplicationPending:
      return 'pending-application';
    case OrganizationAssociateEligibilityReason.EligibleToJoin:
      return 'join';
    case OrganizationAssociateEligibilityReason.ApplicationsNotAccepted:
    case OrganizationAssociateEligibilityReason.ApplyNotGranted:
      return 'closed';
    case OrganizationAssociateEligibilityReason.EligibleToApply:
      return 'apply';
    default:
      return 'none';
  }
};

const graphQLErrorCode = (error: unknown): string | undefined =>
  error instanceof ApolloError ? (error.graphQLErrors[0]?.extensions?.code as string | undefined) : undefined;

export type UseOrganizationAssociateActionResult = {
  action: AssociateActionKind;
  loading: boolean;
  onJoin: () => Promise<void>;
  joining: boolean;
  /** The current user's own pending invitation to THIS organization, when `action === 'respond'`. */
  pendingInvitation: OrgPendingInvitationDataFragment | undefined;
};

type Params = {
  /** The organization's own id — used to match the pending-invitation list, NOT the mutation. */
  organizationId: string | undefined;
  /** The organization's role set id — the actual `joinRoleSet` mutation target. */
  roleSetId: string | undefined;
  eligibilityReason: OrganizationAssociateEligibilityReason | undefined;
  membershipStatus: CommunityMembershipStatus | undefined;
  isAuthenticated: boolean;
  /** Called after a successful join so the caller can refetch the organization query. */
  onJoined: () => void;
};

export const useOrganizationAssociateAction = ({
  organizationId,
  roleSetId,
  eligibilityReason,
  membershipStatus,
  isAuthenticated,
  onJoined,
}: Params): UseOrganizationAssociateActionResult => {
  const { t } = useTranslation('crd-profilePages');
  const notify = useNotification();
  const { userModel } = useCurrentUserContext();

  const action = mapEligibilityToAction(eligibilityReason, membershipStatus);

  // Only fetched when a pending invitation is actually needed to render the
  // Respond action's detail dialog — the top-bar pending dialog shares this
  // exact query and cache entry, so this rarely triggers a fresh request.
  const { data: pendingData, loading: pendingLoading } = useUserPendingMembershipsQuery({
    skip: !isAuthenticated || action !== 'respond' || !userModel,
    fetchPolicy: 'cache-first',
  });
  const pendingInvitation = pendingData?.me.organizationInvitations.find(inv => inv.organization.id === organizationId);

  const [runJoin, { loading: joining }] = useJoinRoleSetMutation();

  const onJoin = async () => {
    if (!roleSetId) return;
    try {
      await runJoin({ variables: { roleSetId } });
      onJoined();
    } catch (error) {
      const code = graphQLErrorCode(error);
      notify(
        code === AlkemioGraphqlErrorCode.ROLESET_JOIN_NOT_ELIGIBLE
          ? t('orgProfile.associate.joinNotEligible')
          : t('orgProfile.associate.joinError'),
        'error'
      );
    }
  };

  return {
    action,
    loading: action === 'respond' && pendingLoading,
    onJoin,
    joining,
    pendingInvitation,
  };
};
