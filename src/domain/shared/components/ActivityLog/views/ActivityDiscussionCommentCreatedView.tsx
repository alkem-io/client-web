import React, { FC } from 'react';
import { ActivityBaseView, ActivityBaseViewProps, NameableEntity } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildCalloutUrl } from '../../../../../common/utils/urlBuilders';
import replaceQuotesInOldDescription from '../../../utils/replaceQuotesInOldDescription';

export interface ActivityDiscussionCommentCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
}

export const ActivityDiscussionCommentCreatedView: FC<ActivityDiscussionCommentCreatedViewProps> = props => {
  const { t } = useTranslation();

  const comment = replaceQuotesInOldDescription(props.description);

  const action = t('components.activity-log-view.actions.discussion-comment-created', {
    calloutDisplayName: props.callout.displayName,
  });
  const description = t('components.activity-log-view.activity-description.discussion-comment-created', {
    comment,
  });
  const url = buildCalloutUrl(props.callout.nameID, props.journeyLocation);

  const resultProps: ActivityBaseViewProps = { ...props, action, url, description };

  return <ActivityBaseView {...resultProps} />;
};
