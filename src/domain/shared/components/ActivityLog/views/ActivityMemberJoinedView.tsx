import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { Community } from '../../../../../core/apollo/generated/graphql-schema';
import { Author } from '../../AuthorAvatar/models/author';
import { Caption } from '../../../../../core/ui/typography';
import ActivityDescriptionByType from '../../ActivityDescription/ActivityDescriptionByType';

interface ActivityMemberJoinedViewProps extends ActivityViewProps {
  member: Author;
  community: Community;
  communityType: string;
}

export const ActivityMemberJoinedView: FC<ActivityMemberJoinedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
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
            journeyDisplayName: community.displayName,
            values: {
              communityType,
              communityDisplayName: community.displayName!,
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
