import React, { FC } from 'react';
import { ActivityBaseView, ActivityBaseViewProps } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildWhiteboardUrl } from '../../../../../common/utils/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import { Caption } from '../../../../../core/ui/typography';

export interface ActivityWhiteboardCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  whiteboard: NameableEntity;
}

export const ActivityWhiteboardCreatedView: FC<ActivityWhiteboardCreatedViewProps> = props => {
  const { t } = useTranslation();

  const description = t('components.activity-log-view.activity-description.whiteboard-created', {
    displayName: props.whiteboard.profile.displayName,
    interpolation: {
      escapeValue: false,
    },
  });
  const url = buildWhiteboardUrl(props.callout.nameID, props.whiteboard.nameID, props.journeyLocation);

  const resultProps: ActivityBaseViewProps = {
    ...props,
    i18nKey: props.parentJourneyTypeName
      ? 'components.activity-log-view.actions-in-journey.whiteboard-created'
      : 'components.activity-log-view.actions.whiteboard-created',
    parentDisplayName: props.callout.profile.displayName,
    url,
  };

  return (
    <ActivityBaseView {...resultProps}>
      <Caption>{description}</Caption>
    </ActivityBaseView>
  );
};
