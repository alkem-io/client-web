import { useTranslation } from 'react-i18next';
import { useActivityLogOnCollaborationQuery, useSpacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import { ActivityDialog } from '@/crd/components/dashboard/ActivityDialog';
import { ActivityFeed } from '@/crd/components/dashboard/ActivityFeed';
import { mapActivityToFeedItems } from '../../dashboard/dashboardDataMappers';

const ACTIVITY_LIMIT = 25;
const ALLOWED_ACTIVITY_TYPES = Object.values(ActivityEventType).filter(
  type => type !== ActivityEventType.CalloutWhiteboardContentModified
);

type CrdSpaceActivityDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string | undefined;
};

export function CrdSpaceActivityDialogConnector({ open, onOpenChange, spaceId }: CrdSpaceActivityDialogConnectorProps) {
  const { t } = useTranslation('crd-space');
  const { t: tMain } = useTranslation();

  const { data: spacePageData } = useSpacePageQuery({
    variables: { spaceId: spaceId! },
    skip: !open || !spaceId,
    errorPolicy: 'all',
  });

  const collaborationID = spacePageData?.lookup.space?.collaboration?.id;

  const { data, loading } = useActivityLogOnCollaborationQuery({
    variables: {
      collaborationID: collaborationID!,
      limit: ACTIVITY_LIMIT,
      types: ALLOWED_ACTIVITY_TYPES,
    },
    skip: !open || !collaborationID,
  });

  const items = mapActivityToFeedItems(data?.activityLogOnCollaboration ?? [], tMain);

  return (
    <ActivityDialog open={open} onClose={() => onOpenChange(false)} title={t('activity.dialogTitle')}>
      <ActivityFeed
        variant="spaces"
        feedId="dialog-space-activity"
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
