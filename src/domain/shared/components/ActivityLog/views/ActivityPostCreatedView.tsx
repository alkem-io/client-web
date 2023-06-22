import React, { FC } from 'react';
import { ActivityBaseView, ActivityBaseViewProps } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildPostUrl } from '../../../../../common/utils/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import OneLineMarkdown from '../../../../../core/ui/markdown/OneLineMarkdown';

export interface ActivityCardCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  card: NameableEntity;
  postType: string;
  postDescription: string;
}

export const ActivityCardCreatedView: FC<ActivityCardCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.post-created', {
    calloutDisplayName: props.callout.profile.displayName,
    interpolation: {
      escapeValue: false,
    },
  });
  const url = buildPostUrl(props.callout.nameID, props.card.nameID, props.journeyLocation);
  const description = t('components.activity-log-view.activity-description.post-created', {
    postDisplayName: props.card.profile.displayName,
    postType: props.postType,
    postDescription: props.postDescription,
    interpolation: {
      escapeValue: false,
    },
  });

  const resultProps: ActivityBaseViewProps = { ...props, action, url };

  return (
    <ActivityBaseView {...resultProps}>
      <OneLineMarkdown>{description}</OneLineMarkdown>
    </ActivityBaseView>
  );
};
