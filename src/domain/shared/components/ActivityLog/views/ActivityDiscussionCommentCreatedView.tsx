import React, { FC } from 'react';
import { ActivityBaseView, NameableEntity } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildCalloutUrl } from '../../../../../common/utils/urlBuilders';
import replaceQuotesInOldDescription from '../../../utils/replaceQuotesInOldDescription';
import OneLineMarkdown from '../../OneLineMarkdown';

export interface ActivityDiscussionCommentCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
}

export const ActivityDiscussionCommentCreatedView: FC<ActivityDiscussionCommentCreatedViewProps> = ({
  callout,
  description,
  journeyLocation,
  ...baseProps
}) => {
  const { t } = useTranslation();

  const action = t('components.activity-log-view.actions.discussion-comment-created', {
    calloutDisplayName: callout.displayName,
  });
  const comment = replaceQuotesInOldDescription(description);
  const translatedDescription = t('components.activity-log-view.activity-description.discussion-comment-created', {
    comment,
    interpolation: {
      escapeValue: false,
    },
  });

  const url = buildCalloutUrl(callout.nameID, journeyLocation);

  return (
    <ActivityBaseView {...baseProps} action={action} url={url}>
      <OneLineMarkdown>{translatedDescription}</OneLineMarkdown>
    </ActivityBaseView>
  );
};
