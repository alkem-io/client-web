import { useTranslation } from 'react-i18next';
import { useActivityLogOnCollaborationQuery } from '@/core/apollo/generated/apollo-hooks';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import { ActivityDialog } from '@/crd/components/dashboard/ActivityDialog';
import { ActivityFeed } from '@/crd/components/dashboard/ActivityFeed';
import { mapActivityToFeedItems } from '../../dashboard/dashboardDataMappers';

const ACTIVITY_LIMIT = 25;
const ALLOWED_ACTIVITY_TYPES = Object.values(ActivityEventType).filter(
  type => type !== ActivityEventType.CalloutWhiteboardContentModified
);

type CrdSubspaceActivityDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborationId: string | undefined;
};

export function CrdSubspaceActivityDialogConnector({
  open,
  onOpenChange,
  collaborationId,
}: CrdSubspaceActivityDialogConnectorProps) {
  const { t } = useTranslation('crd-subspace');
  const { t: tMain } = useTranslation();

  // Mirrors the legacy MUI ActivityDialog: collaboration-scoped query with
  // `includeChild: true` (set inside the query document) so child callout
  // activity surfaces. The personal `activityFeed` (LatestContributions) used
  // here previously is gated by the current user's memberships and missed
  // events for users who could read the subspace but weren't members of the L0.
  const { data, loading } = useActivityLogOnCollaborationQuery({
    variables: {
      collaborationID: collaborationId!,
      limit: ACTIVITY_LIMIT,
      types: ALLOWED_ACTIVITY_TYPES,
    },
    skip: !open || !collaborationId,
  });

  const items = mapActivityToFeedItems(data?.activityLogOnCollaboration ?? [], tMain);

  return (
    <ActivityDialog open={open} onClose={() => onOpenChange(false)} title={t('activity.dialogTitle')}>
      <ActivityFeed
        variant="spaces"
        feedId="dialog-subspace-activity"
        title=""
        items={items}
        loading={loading}
        spaceFilter="all"
        spaceFilterOptions={[]}
        onSpaceFilterChange={() => {}}
        embedded={true}
      />
    </ActivityDialog>
  );
}
