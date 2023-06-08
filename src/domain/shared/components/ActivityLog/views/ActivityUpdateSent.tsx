import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
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
  ...baseProps
}) => {
  const { t } = useTranslation();

  const action = t('components.activity-log-view.actions.update-sent');
  const update = replaceQuotesInOldDescription(message);
  const translatedDescription = t('components.activity-log-view.activity-description.update-sent', {
    update,
    interpolation: {
      escapeValue: false,
    },
  });

  const url = buildUpdatesUrl(journeyLocation);

  return (
    <ActivityBaseView {...baseProps} action={action} url={url}>
      <OneLineMarkdown>{translatedDescription}</OneLineMarkdown>
    </ActivityBaseView>
  );
};
