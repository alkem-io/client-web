import { useTranslation } from 'react-i18next';
import type { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import type { AuthorModel } from '@/domain/community/user/models/AuthorModel';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityBaseView } from './ActivityBaseView';
import type { ActivityViewProps } from './ActivityViewProps';

interface ActivityMemberJoinedViewProps extends ActivityViewProps {
  member: AuthorModel;
  type: ActivityEventType.MemberJoined;
}

export const ActivityMemberJoinedView = ({
  spaceDisplayName,
  member,
  type,
  ...rest
}: ActivityMemberJoinedViewProps) => {
  const { t } = useTranslation();

  return (
    <ActivityBaseView
      {...rest}
      type={type}
      avatarUrl={member.avatarUrl}
      avatarAlt={member.displayName ? t('common.avatar-of', { user: member.displayName }) : t('common.avatar')}
      title={<ActivityDescriptionByType activityType={type} subject={member.displayName} />}
      url={member.url}
      contextDisplayName={spaceDisplayName}
    />
  );
};
