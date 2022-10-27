import React, { FC } from 'react';
import { ActivityBaseView, ActivityBaseViewProps, NameableEntity } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildChallengeUrl } from '../../../../../common/utils/urlBuilders';

export interface ActivityChallengeCreatedViewProps extends ActivityViewProps {
  challenge: NameableEntity;
}

export const ActivityChallengeCreatedView: FC<ActivityChallengeCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.challenge-created');
  const url = buildChallengeUrl(props.journeyLocation.hubNameId, props.challenge.nameID!);
  const description = t('components.activity-log-view.activity-description.challenge-created', {
    displayName: props.challenge.displayName,
  });

  const resultProps: ActivityBaseViewProps = { ...props, action, url, description };

  return <ActivityBaseView {...resultProps} />;
};
