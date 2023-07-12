import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildPostUrl } from '../../../../../common/utils/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import OneLineMarkdown from '../../../../../core/ui/markdown/OneLineMarkdown';
import ActivityDescriptionByType from '../../ActivityDescription/ActivityDescriptionByType';

export interface ActivityCardCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  card: NameableEntity;
  postType: string;
  postDescription: string;
}

export const ActivityCardCreatedView: FC<ActivityCardCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyLocation,
  journeyDisplayName,
  callout,
  card,
  postType,
  postDescription,
}) => {
  const { t } = useTranslation();

  const description = t('components.activity-log-view.activity-description.post-created', {
    postDisplayName: card.profile.displayName,
    postType: postType,
    postDescription: postDescription,
    interpolation: {
      escapeValue: false,
    },
  });

  const url = buildPostUrl(callout.nameID, card.nameID, journeyLocation);

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      title={
        <ActivityDescriptionByType
          activityType="post-created"
          {...{
            author,
            createdDate,
            journeyTypeName,
            journeyLocation,
            journeyDisplayName,
            values: {
              calloutDisplayName: callout.profile.displayName,
            },
          }}
          withLinkToParent={Boolean(journeyTypeName)}
        />
      }
      url={url}
    >
      <OneLineMarkdown>{description}</OneLineMarkdown>
    </ActivityBaseView>
  );
};
