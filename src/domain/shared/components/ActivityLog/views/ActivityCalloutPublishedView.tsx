import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { buildCalloutUrl } from '../../../../../common/utils/urlBuilders';
import { ActivityBaseView, NameableEntity } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';

export interface ActivityCalloutPublishedViewProps extends ActivityViewProps {
  callout: NameableEntity;
}

export const ActivityCalloutPublishedView: FC<ActivityCalloutPublishedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.callout-published');
  const url = buildCalloutUrl(props.callout.nameID, props.journeyLocation);

  return <ActivityBaseView action={action} url={url} {...props} />;
};
