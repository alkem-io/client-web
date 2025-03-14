import { useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import RecentContributionsBlock from './RecentContributionsBlock';
import { ActivityEventType, AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useActivityOnCollaboration from '@/domain/collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';
import { RECENT_ACTIVITIES_LIMIT_INITIAL, TOP_CALLOUTS_LIMIT } from '../journeyDashboard/constants';
import { useSpacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { useUserContext } from '@/domain/community/user/hooks/useUserContext';

export interface ActivityDialogProps {
  open?: boolean;
  onClose?: () => void;
  spaceId: string | undefined;
}

const ActivityDialog = ({ open = false, spaceId, onClose }: ActivityDialogProps) => {
  const { t } = useTranslation();

  const { user } = useUserContext();
  const { data: _space } = useSpacePageQuery({
    variables: {
      spaceId: spaceId!,
    },
    errorPolicy: 'all',
    skip: !spaceId,
  });

  const collaborationID = _space?.lookup.space?.collaboration?.id;

  const spacePrivileges = _space?.lookup.space?.authorization?.myPrivileges ?? [];

  const permissions = {
    readAccess: spacePrivileges.includes(AuthorizationPrivilege.Read),
    readUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) ?? false,
  };

  const activityTypes = Object.values(ActivityEventType).filter(
    activityType => activityType !== ActivityEventType.CalloutWhiteboardContentModified
  );

  const { activities, fetchMoreActivities } = useActivityOnCollaboration(collaborationID, {
    skip: !permissions.readAccess || !permissions.readUsers,
    types: activityTypes,
    limit: RECENT_ACTIVITIES_LIMIT_INITIAL,
  });

  const topCallouts = _space?.lookup.space?.collaboration?.calloutsSet?.callouts?.slice(0, TOP_CALLOUTS_LIMIT);

  return (
    <DialogWithGrid open={open} columns={8} aria-labelledby="activity-dialog">
      <DialogHeader onClose={onClose} title={t('common.contributions')} />
      <DialogContent sx={{ paddingTop: 0 }}>
        <RecentContributionsBlock
          readUsersAccess={permissions.readUsers}
          entityReadAccess={permissions.readAccess}
          activitiesLoading={false}
          topCallouts={topCallouts}
          activities={activities}
          fetchMoreActivities={fetchMoreActivities}
        />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default ActivityDialog;
