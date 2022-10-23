import React, { FC } from 'react';
import { ActivityBaseView, ActivityBaseViewProps, NameableEntity } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildCalloutUrl } from '../../../../../common/utils/urlBuilders';

export interface ActivityDiscussionCommentCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
}

export const ActivityDiscussionCommentCreatedView: FC<ActivityDiscussionCommentCreatedViewProps> = props => {
  const { t } = useTranslation();

  const action = t('components.activity-log-view.actions.discussion-comment-created', {
    calloutDisplayName: props.callout.displayName,
  });
  let description = t('components.activity-log-view.activity-description.discussion-comment-created', {
    comment: `${props.description}`,
  });
  description = description.replace(/&#39;/g, "'"); // hack to deal with old description strings
  const url = buildCalloutUrl(props.callout.nameID, props.journeyLocation);

  const resultProps: ActivityBaseViewProps = { ...props, action, url, description };

  return <ActivityBaseView {...resultProps} />;
};
