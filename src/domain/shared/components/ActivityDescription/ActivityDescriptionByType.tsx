import ActivityDescription, { ActivityDescriptionProps } from './ActivityDescription';

interface ActivityDescriptionByTypeProps extends Omit<ActivityDescriptionProps, 'i18nKey'> {
  activityType:
    | 'callout-published'
    | 'challenge-created'
    | 'discussion-comment-created'
    | 'member-joined'
    | 'post-comment-created'
    | 'post-created'
    | 'whiteboard-created'
    | 'callout-link-created'
    | 'calendar-event-created'
    | 'opportunity-created'
    | 'update-sent';
}

const ActivityDescriptionByType = ({ activityType, ...props }: ActivityDescriptionByTypeProps) => {
  const i18nKey = `components.activity-log-view.actions.${activityType}` as const;

  return <ActivityDescription i18nKey={i18nKey} {...props} />;
};

export default ActivityDescriptionByType;
