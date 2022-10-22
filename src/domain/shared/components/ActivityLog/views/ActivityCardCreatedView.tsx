import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildAspectUrl } from '../../../../../common/utils/urlBuilders';

export interface ActivityCardCreatedViewProps extends ActivityViewProps {}

export const ActivityCardCreatedView: FC<ActivityCardCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.card-created');
  const url = buildAspectUrl({ ...card, aspectNameId: card.nameID });

  return <ActivityBaseView action={action} url={url} {...props} />;
};
