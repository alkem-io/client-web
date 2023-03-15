import React, { FC } from 'react';
import { ActivityBaseView, ActivityBaseViewProps } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildChallengeUrl } from '../../../../../common/utils/urlBuilders';
import { NameableEntityOld } from '../../../types/NameableEntity';

export interface ActivityChallengeCreatedViewProps extends ActivityViewProps {
  challenge: NameableEntityOld;
}

export const ActivityChallengeCreatedView: FC<ActivityChallengeCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.challenge-created');
  const url = buildChallengeUrl(props.journeyLocation.hubNameId, props.challenge.nameID!);
  const description = t('components.activity-log-view.activity-description.challenge-created', {
    displayName: props.challenge.displayName,
    interpolation: {
      escapeValue: false,
    },
  });

  const resultProps: ActivityBaseViewProps = { ...props, action, url };

  return <ActivityBaseView {...resultProps}>{description}</ActivityBaseView>;
};
