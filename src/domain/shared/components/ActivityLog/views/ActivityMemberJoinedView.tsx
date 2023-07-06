import React, { FC } from 'react';
import { ActivityBaseView, ActivityBaseViewProps } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { Community } from '../../../../../core/apollo/generated/graphql-schema';
import { Author } from '../../AuthorAvatar/models/author';
import { Caption } from '../../../../../core/ui/typography';
import { JourneyTypeName } from '../../../../challenge/JourneyTypeName';
import useActivityViewParams from './useActivityViewParams';
import ActivityDescription from '../../ActivityDescription/ActivityDescription';

export interface ActivityMemberJoinedViewProps extends ActivityViewProps {
  member: Author;
  community: Community;
  communityType: string;
}

export const ActivityMemberJoinedView: FC<ActivityMemberJoinedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyDisplayName,
  journeyLocation,
  member,
  community,
  communityType,
}) => {
  const { t } = useTranslation();

  const description = t('components.activity-log-view.activity-description.member-joined', {
    user: member.displayName,
    interpolation: {
      escapeValue: false,
    },
  });

  const url = member.url;

  const { i18nKey, values, components } = useActivityViewParams({
    activityType: 'member-joined',
    author,
    createdDate,
    journeyTypeName,
    parentDisplayName: community.displayName,
    values: {
      user: member.displayName,
    },
  });

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      title={<ActivityDescription i18nKey={i18nKey} values={values} components={components} />}
      url={url}
    >
      <Caption>{description}</Caption>
    </ActivityBaseView>
  );
};
