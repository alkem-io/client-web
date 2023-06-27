import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { buildCalloutUrl } from '../../../../../common/utils/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import { ActivityBaseView, ActivityBaseViewProps } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { Caption } from '../../../../../core/ui/typography';

export interface ActivityCalloutPublishedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  calloutType: string;
}

export const ActivityCalloutPublishedView: FC<ActivityCalloutPublishedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.callout-published');
  const description = t('components.activity-log-view.activity-description.callout-published', {
    displayName: props.callout.profile.displayName,
    type: props.calloutType,
    interpolation: {
      escapeValue: false,
    },
  });
  const url = buildCalloutUrl(props.callout.nameID, props.journeyLocation);
  const resultProps: ActivityBaseViewProps = { ...props, action, url };

  return (
    <ActivityBaseView {...resultProps}>
      <Caption>{description}</Caption>
    </ActivityBaseView>
  );
};
