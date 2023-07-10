import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildCalloutUrl } from '../../../../../common/utils/urlBuilders';
import replaceQuotesInOldDescription from '../../../utils/replaceQuotesInOldDescription';
import OneLineMarkdown from '../../../../../core/ui/markdown/OneLineMarkdown';
import { NameableEntity } from '../../../types/NameableEntity';
import ActivityDescription from '../../ActivityDescription/ActivityDescription';
import useActivityViewParams from './useActivityViewParams';

export interface ActivityDiscussionCommentCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  description: string;
}

export const ActivityDiscussionCommentCreatedView: FC<ActivityDiscussionCommentCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyLocation,
  parentDisplayName,
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

  const url = buildCalloutUrl(callout.nameID, journeyLocation);

  const { i18nKey, values, components } = useActivityViewParams({
    activityType: 'discussion-comment-created',
    author,
    createdDate,
    journeyTypeName,
    journeyLocation,
    parentDisplayName,
    values: {
      calloutDisplayName: callout.profile.displayName,
    },
  });

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      title={
        <ActivityDescription
          i18nKey={i18nKey}
          values={values}
          components={components}
          withLinkToParent={Boolean(journeyTypeName)}
        />
      }
      url={url}
    >
      <OneLineMarkdown>{translatedDescription}</OneLineMarkdown>
    </ActivityBaseView>
  );
};
