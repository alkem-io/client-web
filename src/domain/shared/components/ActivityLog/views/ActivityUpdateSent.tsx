import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildUpdatesUrl } from '../../../../../common/utils/urlBuilders';
import replaceQuotesInOldDescription from '../../../utils/replaceQuotesInOldDescription';
import OneLineMarkdown from '../../../../../core/ui/markdown/OneLineMarkdown';
import useActivityViewParams from './useActivityViewParams';
import ActivityDescription from '../../ActivityDescription/ActivityDescription';

export interface ActivityUpdateSentViewProps extends ActivityViewProps {
  message: string;
}

export const ActivityUpdateSentView: FC<ActivityUpdateSentViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyLocation,
  parentDisplayName,
  message,
}) => {
  const { t } = useTranslation();

  const update = replaceQuotesInOldDescription(message);
  const translatedDescription = t('components.activity-log-view.activity-description.update-sent', {
    update,
    interpolation: {
      escapeValue: false,
    },
  });

  const url = buildUpdatesUrl(journeyLocation);

  const { i18nKey, values, components } = useActivityViewParams({
    activityType: 'update-sent',
    author,
    createdDate,
    journeyTypeName,
    journeyLocation,
    parentDisplayName,
  });

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      title={
        <ActivityDescription
          i18nKey={i18nKey}
          values={values}
          components={components}
          withLinkToParent={Boolean(journeyTypeName)}
        />
      }
      url={url}
    >
      <OneLineMarkdown>{translatedDescription}</OneLineMarkdown>
    </ActivityBaseView>
  );
};
