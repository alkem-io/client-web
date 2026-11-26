import { useFragment } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { MembershipRequestRowFragmentDoc } from '@/core/apollo/generated-v2/apollo-hooks';
import type { MembershipRequestRowFragment } from '@/core/apollo/generated-v2/graphql-schema';
import type { MembershipDetailDialogProps } from '@/crd/components/space/settings/MembershipDetailDialog';
import { MembershipDetailDialog } from '@/crd/components/space/settings/MembershipDetailDialog';
import type { PendingMembershipType } from '@/crd/components/space/settings/PendingMembershipsTable';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import {
  extraRoles,
  toQuestions,
} from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';
import { offeredRoleLabelKey } from '@/main/crdPages/topLevelPages/organizationPages/publicProfile/organizationProfileMapper';

export type ViewingMembership = { id: string; type: PendingMembershipType };

type MembershipDetailDialogConnectorProps = {
  /** The membership whose detail to view, or `null` when the dialog is closed. */
  membership: ViewingMembership | null;
  onOpenChange: (open: boolean) => void;
  /** Renders the invitation's offered extra role (Associate / Associate+Admin / Associate+Owner).
   * Only the organization Associates consumer sets this — Space invitations don't offer this
   * role vocabulary, so the Space settings consumer leaves it unset. */
  showOfferedRole?: boolean;
};

type Location = { city?: string; country?: string } | null | undefined;

/**
 * Maps one pending request onto the presentational `MembershipDetailDialog`. The dialog takes the row of the
 * `requests` list that opened it — answers, message, created and last-decided dates (A9.25, community-roles-screens.tsv
 * "request-detail"): no read of its own.
 */
export function MembershipDetailDialogConnector({
  membership,
  onOpenChange,
  showOfferedRole,
}: MembershipDetailDialogConnectorProps) {
  const { t } = useTranslation('crd-contributorSettings');
  const open = membership !== null;
  const { data, complete } = useFragment<MembershipRequestRowFragment>({
    fragment: MembershipRequestRowFragmentDoc,
    fragmentName: 'MembershipRequestRow',
    from: { __typename: 'MembershipRequest', id: membership?.id ?? '' },
  });
  const request = open && complete ? (data as MembershipRequestRowFragment) : undefined;
  const actor = request?.actor;
  const location = actor?.about?.location as Location;
  const updatedDate = request ? (request.decidedAt ?? request.createdAt) : undefined;

  const detailProps = ((): Omit<MembershipDetailDialogProps, 'open' | 'onOpenChange'> => {
    if (membership?.type === 'application') {
      return {
        kind: 'application',
        loading: open && !request,
        displayName: actor?.about?.displayName,
        avatarUrl: actor?.about?.avatar?.file.url,
        avatarColor: pickColorFromId(actor?.id ?? membership.id),
        city: location?.city,
        country: location?.country,
        createdDate: request?.createdAt,
        updatedDate,
        questions: request
          ? toQuestions(request.answers).map(q => ({ id: q.id, question: q.name, answer: q.value }))
          : undefined,
      };
    }
    if (membership?.type === 'platformInvitation') {
      return {
        kind: 'invitation',
        loading: open && !request,
        email: request?.email ?? undefined,
        createdDate: request?.createdAt,
        updatedDate,
        welcomeMessage: request?.message ?? undefined,
      };
    }
    return {
      kind: 'invitation',
      loading: open && !request,
      displayName: actor?.about?.displayName,
      avatarUrl: actor?.about?.avatar?.file.url,
      avatarColor: pickColorFromId(actor?.id ?? membership?.id ?? ''),
      city: location?.city,
      country: location?.country,
      createdDate: request?.createdAt,
      updatedDate,
      welcomeMessage: request?.message ?? undefined,
      offeredRoleLabel:
        showOfferedRole && request
          ? t(`org.associates.pending.offeredRole.${offeredRoleLabelKey(extraRoles(request.roles))}`)
          : undefined,
    };
  })();

  return <MembershipDetailDialog open={open} onOpenChange={onOpenChange} {...detailProps} />;
}
