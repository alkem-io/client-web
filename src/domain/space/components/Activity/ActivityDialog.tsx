import { useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import RecentContributionsBlock from './RecentContributionsBlock';
import { ActivityEventType, AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useActivityOnCollaboration from '@/domain/collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';
import { RECENT_ACTIVITIES_LIMIT_INITIAL, TOP_CALLOUTS_LIMIT } from '../../common/constants';
import { useSpacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export interface ActivityDialogProps {
  open?: boolean;
  onClose?: () => void;
}

const ActivityDialog = ({ open = false, onClose }: ActivityDialogProps) => {
  const { t } = useTranslation();
  const { spaceId } = useUrlResolver();

  const { platformPrivilegeWrapper: userWrapper } = useCurrentUserContext();
  const { data: _space } = useSpacePageQuery({
    variables: {
      spaceId: spaceId!,
    },
    errorPolicy: 'all',
    skip: !open || !spaceId,
  });

  const collaborationID = _space?.lookup.space?.collaboration?.id;

  const spacePrivileges = _space?.lookup.space?.authorization?.myPrivileges ?? [];

  const permissions = {
    readAccess: spacePrivileges.includes(AuthorizationPrivilege.Read),
    readUsers: userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) ?? false,
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
    <DialogWithGrid open={open} columns={8} aria-labelledby="activity-dialog" onClose={onClose}>
      <DialogHeader id="activity-dialog" onClose={onClose} title={t('common.contributions')} />
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
