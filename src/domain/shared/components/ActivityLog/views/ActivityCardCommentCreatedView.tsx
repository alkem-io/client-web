import React, { FC } from 'react';
import { ActivityBaseView, ActivityBaseViewProps, NameableEntity } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildAspectUrl } from '../../../../../common/utils/urlBuilders';
import replaceQuotesInOldDescription from '../../../utils/replaceQuotesInOldDescription';

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
  const comment = replaceQuotesInOldDescription(props.description);
  const description = t('components.activity-log-view.activity-description.card-comment-created', {
    cardDisplayName: props.card.displayName,
    comment,
  });

  const resultProps: ActivityBaseViewProps = { ...props, action, url, description };

  return <ActivityBaseView {...resultProps} />;
};
