import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import { ActivityDialog } from '@/crd/components/dashboard/ActivityDialog';
import { ActivityFeed } from '@/crd/components/dashboard/ActivityFeed';
import useActivityOnCollaboration from '@/domain/collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';
import { mapActivityToFeedItems } from '../../dashboard/dashboardDataMappers';

const RECENT_ACTIVITIES_LIMIT_INITIAL = 15;
const RECENT_ACTIVITIES_LIMIT_EXPANDED = 50;

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
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { spaceId: spaceId! },
    skip: !open || !spaceId,
    errorPolicy: 'all',
  });

  const collaborationID = spacePageData?.lookup.space?.collaboration?.id;

  const { activities, loading, fetchMoreActivities } = useActivityOnCollaboration(collaborationID, {
    types: ALLOWED_ACTIVITY_TYPES,
    limit: RECENT_ACTIVITIES_LIMIT_INITIAL,
    skip: !open || !collaborationID,
  });

  // Mirror the MUI ActivityDialog behaviour (RecentContributionsBlock): refetch
  // once with the expanded limit as soon as the initial page comes back full.
  // The query has no cursor pagination — the ref guards against the underlying
  // list having exactly INITIAL items, where the refetch would return the same
  // length and re-trigger the effect.
  const expandedOnceRef = useRef(false);
  useEffect(() => {
    if (!open) {
      expandedOnceRef.current = false;
      return;
    }
    if (!expandedOnceRef.current && activities?.length === RECENT_ACTIVITIES_LIMIT_INITIAL) {
      expandedOnceRef.current = true;
      fetchMoreActivities(RECENT_ACTIVITIES_LIMIT_EXPANDED);
    }
  }, [open, activities, fetchMoreActivities]);

  const items = mapActivityToFeedItems(activities ?? [], tMain);

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
