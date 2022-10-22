import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildCanvasUrl } from '../../../../../common/utils/urlBuilders';

export interface ActivityCanvasCreatedViewProps extends ActivityViewProps {}

export const ActivityCanvasCreatedView: FC<ActivityCanvasCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.canvas-created');
  const url = buildCanvasUrl({ ...canvas, canvasNameId: canvas.nameID });

  return <ActivityBaseView action={action} url={url} {...props} />;
};
