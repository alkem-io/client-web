import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildCalloutUrl } from '../../../../../main/routing/urlBuilders';
import replaceQuotesInOldDescription from '../../../utils/replaceQuotesInOldDescription';
import OneLineMarkdown from '../../../../../core/ui/markdown/OneLineMarkdown';
import ActivityDescriptionByType from '../../ActivityDescription/ActivityDescriptionByType';
import { ActivityCalloutValues } from '../../../types/ActivityCalloutValues';

interface ActivityDiscussionCommentCreatedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  description: string;
}

export const ActivityDiscussionCommentCreatedView: FC<ActivityDiscussionCommentCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyUrl,
  journeyDisplayName,
  callout,
  description,
}) => {
  const { t } = useTranslation();

  const comment = replaceQuotesInOldDescription(description);
  const translatedDescription = t('components.activity-log-view.activity-description.discussion-comment-created', {
    comment,
    interpolation: {
      escapeValue: false,
    },
  });

  const url = buildCalloutUrl(callout.nameID, journeyUrl);

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      title={
        <ActivityDescriptionByType
          activityType="discussion-comment-created"
          {...{
            author,
            createdDate,
            journeyTypeName,
            journeyUrl,
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
      <OneLineMarkdown>{translatedDescription}</OneLineMarkdown>
    </ActivityBaseView>
  );
};
