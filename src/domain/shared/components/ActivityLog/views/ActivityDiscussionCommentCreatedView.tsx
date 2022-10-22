import React, { FC } from 'react';
import { ActivityBaseView, NameableEntity } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildCalloutUrl } from '../../../../../common/utils/urlBuilders';

export interface ActivityDiscussionCommentCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
}

export const ActivityDiscussionCommentCreatedView: FC<ActivityDiscussionCommentCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.discussion-comment-created');

  const url = buildCalloutUrl(props.callout.nameID, props.journeyLocation);

  return <ActivityBaseView action={action} url={url} {...props} />;
};
