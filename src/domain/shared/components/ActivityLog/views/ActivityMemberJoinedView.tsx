import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { Author } from '../../AuthorAvatar/models/author';
import { Caption } from '../../../../../core/ui/typography';
import ActivityDescriptionByType from '../../ActivityDescription/ActivityDescriptionByType';

interface ActivityMemberJoinedViewProps extends ActivityViewProps {
  member: Author;
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

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      title={
        <ActivityDescriptionByType
          activityType="member-joined"
          {...{
            author,
            createdDate,
            journeyTypeName,
            journeyLocation,
            journeyDisplayName,
            values: {
              communityType,
            },
          }}
          withLinkToParent={Boolean(journeyTypeName)}
        />
      }
      url={url}
    >
      <Caption>{description}</Caption>
    </ActivityBaseView>
  );
};
