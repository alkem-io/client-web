import React, { FC } from 'react';
import { ActivityBaseView, NameableEntity } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildCanvasUrl } from '../../../../../common/utils/urlBuilders';

export interface ActivityCanvasCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  canvas: NameableEntity;
}

export const ActivityCanvasCreatedView: FC<ActivityCanvasCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.canvas-created');
  const url = buildCanvasUrl(props.callout.nameID, props.canvas.nameID, props.journeyLocation);

  return <ActivityBaseView action={action} url={url} {...props} />;
};
