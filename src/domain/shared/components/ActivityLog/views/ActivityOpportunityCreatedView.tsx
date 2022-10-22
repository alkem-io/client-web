import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildOpportunityUrl } from '../../../../../common/utils/urlBuilders';

export interface ActivityOpportunityCreatedViewProps extends ActivityViewProps {}

export const ActivityOpportunityCreatedView: FC<ActivityOpportunityCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.opportunity-created');
  const url = buildOpportunityUrl(opportunity.hubNameId, opportunity.challengeNameId, opportunity.nameID);

  return <ActivityBaseView action={action} url={url} {...props} />;
};
