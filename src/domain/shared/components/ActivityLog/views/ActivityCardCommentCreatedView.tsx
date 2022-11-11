import React, { FC } from 'react';
import { ActivityBaseView, NameableEntity } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildAspectUrl } from '../../../../../common/utils/urlBuilders';
import replaceQuotesInOldDescription from '../../../utils/replaceQuotesInOldDescription';
import OneLineMarkdown from '../../OneLineMarkdown';

export interface ActivityCardCommentCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  card: NameableEntity;
}

export const ActivityCardCommentCreatedView: FC<ActivityCardCommentCreatedViewProps> = ({
  card,
  callout,
  journeyLocation,
  description,
  ...baseProps
}) => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.card-comment-created', {
    cardDisplayName: card.displayName,
  });
  const url = buildAspectUrl(callout.nameID, card.nameID, journeyLocation);
  const comment = replaceQuotesInOldDescription(description);
  const translatedDescription = t('components.activity-log-view.activity-description.card-comment-created', {
    cardDisplayName: card.displayName,
    comment,
    interpolation: {
      escapeValue: false,
    },
  });

  return (
    <ActivityBaseView {...baseProps} action={action} url={url}>
      <OneLineMarkdown>{translatedDescription}</OneLineMarkdown>
    </ActivityBaseView>
  );
};
