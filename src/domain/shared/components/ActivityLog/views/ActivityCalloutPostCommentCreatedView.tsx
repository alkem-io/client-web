import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildPostUrl } from '../../../../../main/routing/urlBuilders';
import replaceQuotesInOldDescription from '../../../utils/replaceQuotesInOldDescription';
import OneLineMarkdown from '../../../../../core/ui/markdown/OneLineMarkdown';
import { NameableEntity } from '../../../types/NameableEntity';
import ActivityDescriptionByType from '../../ActivityDescription/ActivityDescriptionByType';
import { ActivityCalloutValues } from '../../../types/ActivityCalloutValues';

interface ActivityCalloutPostCommentCreatedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  card: NameableEntity;
  description: string;
}

export const ActivityCalloutPostCommentCreatedView: FC<ActivityCalloutPostCommentCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyLocation,
  journeyDisplayName,
  card,
  callout,
  description,
}) => {
  const { t } = useTranslation();

  const comment = replaceQuotesInOldDescription(description);
  const translatedDescription = t('components.activity-log-view.activity-description.post-comment-created', {
    postDisplayName: card.profile.displayName,
    comment,
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
          activityType="post-comment-created"
          {...{
            author,
            createdDate,
            journeyTypeName,
            journeyLocation,
            journeyDisplayName,
            values: {
              postDisplayName: card.profile.displayName,
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
