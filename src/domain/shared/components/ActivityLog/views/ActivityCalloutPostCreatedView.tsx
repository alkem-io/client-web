import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildPostUrl } from '../../../../../main/routing/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import OneLineMarkdown from '../../../../../core/ui/markdown/OneLineMarkdown';
import ActivityDescriptionByType from '../../ActivityDescription/ActivityDescriptionByType';
import { ActivityCalloutValues } from '../../../types/ActivityCalloutValues';

interface ActivityCalloutPostCreatedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  post: NameableEntity;
  postType: string;
  postDescription: string;
}

export const ActivityCalloutPostCreatedView: FC<ActivityCalloutPostCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyLocation,
  journeyDisplayName,
  callout,
  post,
  postType,
  postDescription,
}) => {
  const { t } = useTranslation();

  const description = t('components.activity-log-view.activity-description.post-created', {
    postDisplayName: post.profile.displayName,
    postType: postType,
    postDescription: postDescription,
    interpolation: {
      escapeValue: false,
    },
  });

  const url = buildPostUrl(callout.nameID, post.nameID, journeyLocation);

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
              calloutDisplayName: callout.framing.profile.displayName,
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
