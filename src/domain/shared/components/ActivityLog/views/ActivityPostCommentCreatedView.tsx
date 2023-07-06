import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildPostUrl } from '../../../../../common/utils/urlBuilders';
import replaceQuotesInOldDescription from '../../../utils/replaceQuotesInOldDescription';
import OneLineMarkdown from '../../../../../core/ui/markdown/OneLineMarkdown';
import { NameableEntity } from '../../../types/NameableEntity';
import useActivityViewParams from './useActivityViewParams';
import ActivityDescription from '../../ActivityDescription/ActivityDescription';

export interface ActivityCardCommentCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  card: NameableEntity;
  description: string;
}

export const ActivityCardCommentCreatedView: FC<ActivityCardCommentCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  parentDisplayName,
  journeyLocation,
  card,
  callout,
  description,
}) => {
  const { t } = useTranslation();

  const comment = replaceQuotesInOldDescription(description);
  const translatedDescription = t('components.activity-log-view.activity-description.post-comment-created', {
    postDisplayName: card.profile.displayName,
    comment,
    interpolation: {
      escapeValue: false,
    },
  });

  const url = buildPostUrl(callout.nameID, card.nameID, journeyLocation);

  const { i18nKey, values, components } = useActivityViewParams({
    activityType: 'post-comment-created',
    author,
    createdDate,
    journeyTypeName,
    parentDisplayName,
    values: {
      postDisplayName: card.profile.displayName,
    },
  });

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      title={<ActivityDescription i18nKey={i18nKey} values={values} components={components} />}
      url={url}
    >
      <OneLineMarkdown>{translatedDescription}</OneLineMarkdown>
    </ActivityBaseView>
  );
};
