import { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';
import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';
import { useTranslation } from 'react-i18next';

export const InAppPlatformForumDiscussionCreatedView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;
  const { t } = useTranslation();

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.discussion) {
    return null;
  }
  const discussion = payload.discussion;

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    discussionName: discussion.displayName,
    category: discussion.category
      ? t(`common.enums.discussion-category.${discussion.category as ForumDiscussionCategory}`)
      : '',
    comment: discussion.description || '',
  };

  return (
    <InAppNotificationBaseView notification={notification} values={notificationTextValues} url={discussion?.url} />
  );
};
