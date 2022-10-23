import React, { FC } from 'react';
import { ActivityBaseView, ActivityBaseViewProps, NameableEntity } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildAspectUrl } from '../../../../../common/utils/urlBuilders';

export interface ActivityCardCommentCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  card: NameableEntity;
}

export const ActivityCardCommentCreatedView: FC<ActivityCardCommentCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.card-comment-created', {
    cardDisplayName: props.card.displayName,
  });
  const url = buildAspectUrl(props.callout.nameID, props.card.nameID, props.journeyLocation);
  let description = t('components.activity-log-view.activity-description.card-comment-created', {
    cardDisplayName: props.card.displayName,
    comment: props.description,
  });
  description = description.replace(/&#39;/g, "'"); // hack to deal with old description strings

  const resultProps: ActivityBaseViewProps = { ...props, action, url, description };

  return <ActivityBaseView {...resultProps} />;
};
