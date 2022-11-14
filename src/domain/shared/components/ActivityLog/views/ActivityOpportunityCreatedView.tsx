import React, { FC } from 'react';
import { ActivityBaseView, ActivityBaseViewProps, NameableEntity } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildOpportunityUrl } from '../../../../../common/utils/urlBuilders';

export interface ActivityOpportunityCreatedViewProps extends ActivityViewProps {
  opportunity: NameableEntity;
}

export const ActivityOpportunityCreatedView: FC<ActivityOpportunityCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.opportunity-created');
  const url = buildOpportunityUrl(
    props.journeyLocation.hubNameId,
    props.journeyLocation.challengeNameId!,
    props.opportunity.nameID!
  );
  const description = t('components.activity-log-view.activity-description.opportunity-created', {
    displayName: props.opportunity.displayName,
    interpolation: {
      escapeValue: false,
    },
  });

  const resultProps: ActivityBaseViewProps = { ...props, action, url };

  return <ActivityBaseView {...resultProps}>{description}</ActivityBaseView>;
};
