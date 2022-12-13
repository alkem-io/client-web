import React, { FC } from 'react';
import { ActivityBaseView, ActivityBaseViewProps, NameableEntity } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildAspectUrl } from '../../../../../common/utils/urlBuilders';

export interface ActivityCardCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  card: NameableEntity;
  cardType: string;
  cardDescription: string;
}

export const ActivityCardCreatedView: FC<ActivityCardCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.card-created', {
    calloutDisplayName: props.callout.displayName,
    interpolation: {
      escapeValue: false,
    },
  });
  const url = buildAspectUrl(props.callout.nameID, props.card.nameID, props.journeyLocation);
  const description = t('components.activity-log-view.activity-description.card-created', {
    cardDisplayName: props.card.displayName,
    cardType: props.cardType,
    cardDescription: props.cardDescription,
    interpolation: {
      escapeValue: false,
    },
  });

  const resultProps: ActivityBaseViewProps = { ...props, action, url };

  return <ActivityBaseView {...resultProps}>{description}</ActivityBaseView>;
};
