import { useTranslation } from 'react-i18next';
import { ActivityDialog } from '@/crd/components/dashboard/ActivityDialog';
import { ActivityFeed } from '@/crd/components/dashboard/ActivityFeed';
import {
  mapNativeActivityToFeedItems,
  WHITEBOARD_CONTENT_MODIFIED_ACTIVITY,
} from '../../dashboard/dashboardDataMappers';

type SpaceActivity = Parameters<typeof mapNativeActivityToFeedItems>[0];

/**
 * A space's activity as served. It is not space-tree data and Query.spaceActivity is not read (spaces 2026-11-26), so
 * the dialog says "This content is not available yet." until a reader serves it; the one place it lights up.
 */
const servedSpaceActivity = (_spaceId: string | undefined): SpaceActivity | undefined => undefined;

type CrdSpaceActivityDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string | undefined;
};

export function CrdSpaceActivityDialogConnector({ open, onOpenChange, spaceId }: CrdSpaceActivityDialogConnectorProps) {
  const { t } = useTranslation('crd-space');
  const { t: tMain } = useTranslation();

  // 021 D7 on open only, the legacy 25; whiteboard-content-modified is dropped here, as legacy excluded it.
  const activities = open && spaceId ? servedSpaceActivity(spaceId) : undefined;
  const items =
    activities &&
    mapNativeActivityToFeedItems(
      activities.filter(activity => activity.type !== WHITEBOARD_CONTENT_MODIFIED_ACTIVITY),
      tMain
    );

  return (
    <ActivityDialog open={open} onClose={() => onOpenChange(false)} title={t('activity.dialogTitle')}>
      {items ? (
        <ActivityFeed
          variant="spaces"
          feedId="dialog-space-activity"
          title=""
          items={items}
          loading={false}
          spaceFilter="all"
          spaceFilterOptions={[]}
          onSpaceFilterChange={() => {}}
          embedded={true}
        />
      ) : (
        <p className="text-body text-muted-foreground py-6 text-center">{t('tabs.unavailable')}</p>
      )}
    </ActivityDialog>
  );
}
