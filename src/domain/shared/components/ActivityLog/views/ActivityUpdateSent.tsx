import React, { FC } from 'react';
import { ActivityBaseView, ActivityBaseViewProps } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildUpdatesUrl } from '../../../../../common/utils/urlBuilders';
import replaceQuotesInOldDescription from '../../../utils/replaceQuotesInOldDescription';
import OneLineMarkdown from '../../../../../core/ui/markdown/OneLineMarkdown';

export interface ActivityUpdateSentViewProps extends ActivityViewProps {
  message: string;
}

export const ActivityUpdateSentView: FC<ActivityUpdateSentViewProps> = ({
  message,
  description,
  journeyLocation,
  ...props
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

  const resultProps: ActivityBaseViewProps = {
    ...props,
    i18nKey: props.parentJourneyTypeName
      ? 'components.activity-log-view.actions-in-journey.update-sent'
      : 'components.activity-log-view.actions.update-sent',
    url,
  };

  return (
    <ActivityBaseView {...resultProps}>
      <OneLineMarkdown>{translatedDescription}</OneLineMarkdown>
    </ActivityBaseView>
  );
};
