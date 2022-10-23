import React, { FC } from 'react';
import { ActivityBaseView, NameableEntity } from './ActivityBaseView';
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

  return <ActivityBaseView action={action} url={url} {...props} />;
};
