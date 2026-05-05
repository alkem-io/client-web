import { useTranslation } from 'react-i18next';
import { useLatestContributionsQuery } from '@/core/apollo/generated/apollo-hooks';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import { ActivityDialog } from '@/crd/components/dashboard/ActivityDialog';
import { ActivityFeed } from '@/crd/components/dashboard/ActivityFeed';
import { mapActivityToFeedItems } from '../../dashboard/dashboardDataMappers';

const ACTIVITY_LIMIT = 25;
const EXCLUDED_ACTIVITY_TYPES = [ActivityEventType.CalloutWhiteboardContentModified];

type CrdSubspaceActivityDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subspaceId: string | undefined;
};

export function CrdSubspaceActivityDialogConnector({
  open,
  onOpenChange,
  subspaceId,
}: CrdSubspaceActivityDialogConnectorProps) {
  const { t } = useTranslation('crd-subspace');
  const { t: tMain } = useTranslation();

  const { data, loading } = useLatestContributionsQuery({
    variables: {
      first: ACTIVITY_LIMIT,
      filter: {
        spaceIds: subspaceId ? [subspaceId] : [],
        excludeTypes: EXCLUDED_ACTIVITY_TYPES,
      },
    },
    skip: !open || !subspaceId,
  });

  const items = mapActivityToFeedItems(data?.activityFeed?.activityFeed ?? [], tMain);

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
