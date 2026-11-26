import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpaceCommunityQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { SpaceMembers } from '@/crd/components/space/SpaceMembers';
import { SubspaceCommunityDialog } from '@/crd/components/space/SubspaceCommunityDialog';
import { MEMBERS_FIRST, useNotServed, wasNotServed } from '@/domain/space/hooks/useSpacePage';
import { mapNativeMembersToMemberCards } from '../dataMappers/communityDataMapper';

type CrdSpaceCommunityDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The space whose roster is listed (legacy's role set id is the space's own id natively). */
  roleSetId: string | undefined;
  /** Optional title override; defaults to t('crd-subspace:community.dialogTitle'). */
  title?: string;
  description?: string;
};

export function CrdSpaceCommunityDialogConnector({
  open,
  onOpenChange,
  roleSetId,
  title,
  description,
}: CrdSpaceCommunityDialogConnectorProps) {
  const { t } = useTranslation(['crd-subspace', 'crd-space']);
  const handleError = useApolloErrorHandler();

  // 021 D6 on open only, the whole roster: 500 per request, continued with no control (S23-LIST-PAGE-500). While the
  // server does not serve the members read yet, the dialog says so in place (asked once, never retried).
  const { data, loading, error, fetchMore } = useSpaceCommunityQuery({
    variables: { space: roleSetId ?? '', first: MEMBERS_FIRST },
    skip: !open || !roleSetId || wasNotServed('community', roleSetId),
  });
  const notServed = useNotServed('community', roleSetId, error);
  const pageInfo = data?.members.pageInfo;
  const after = open && pageInfo?.hasNextPage ? pageInfo.endCursor : undefined;
  useEffect(() => {
    if (after) fetchMore({ variables: { after } }).catch(handleError);
  }, [after]);

  const members = mapNativeMembersToMemberCards(data?.members.edges.map(edge => edge.node) ?? []);

  return (
    <SubspaceCommunityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title ?? t('community.dialogTitle')}
      description={description ?? t('community.dialogDescription')}
      closeLabel={t('a11y.close')}
    >
      {notServed ? (
        <p className="text-body text-muted-foreground py-6 text-center">{t('tabs.unavailable', { ns: 'crd-space' })}</p>
      ) : (
        <SpaceMembers
          members={members}
          pageSize={9}
          // Loading state is briefly visible — SpaceMembers shows its empty state otherwise.
          title={title ?? t('community.dialogTitle')}
          subtitle={loading ? '' : undefined}
        />
      )}
    </SubspaceCommunityDialog>
  );
}
