import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildPostUrl } from '../../../../../common/utils/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import OneLineMarkdown from '../../../../../core/ui/markdown/OneLineMarkdown';
import useActivityViewParams from './useActivityViewParams';
import ActivityDescription from '../../ActivityDescription/ActivityDescription';

export interface ActivityCardCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  card: NameableEntity;
  postType: string;
  postDescription: string;
}

export const ActivityCardCreatedView: FC<ActivityCardCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  parentDisplayName,
  journeyLocation,
  callout,
  card,
  postType,
  postDescription,
}) => {
  const { t } = useTranslation();

  const description = t('components.activity-log-view.activity-description.post-created', {
    postDisplayName: card.profile.displayName,
    postType: postType,
    postDescription: postDescription,
    interpolation: {
      escapeValue: false,
    },
  });

  const url = buildPostUrl(callout.nameID, card.nameID, journeyLocation);

  const { i18nKey, values, components } = useActivityViewParams({
    activityType: 'post-created',
    author,
    createdDate,
    journeyTypeName,
    parentDisplayName,
    values: {
      calloutDisplayName: callout.profile.displayName,
    },
  });

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      title={<ActivityDescription i18nKey={i18nKey} values={values} components={components} />}
      url={url}
    >
      <OneLineMarkdown>{description}</OneLineMarkdown>
    </ActivityBaseView>
  );
};
