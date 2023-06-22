import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildPostUrl } from '../../../../../common/utils/urlBuilders';
import replaceQuotesInOldDescription from '../../../utils/replaceQuotesInOldDescription';
import OneLineMarkdown from '../../../../../core/ui/markdown/OneLineMarkdown';
import { NameableEntity } from '../../../types/NameableEntity';

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
  const action = t('components.activity-log-view.actions.post-comment-created', {
    postDisplayName: card.profile.displayName,
    interpolation: {
      escapeValue: false,
    },
  });
  const url = buildPostUrl(callout.nameID, card.nameID, journeyLocation);
  const comment = replaceQuotesInOldDescription(description);
  const translatedDescription = t('components.activity-log-view.activity-description.post-comment-created', {
    postDisplayName: card.profile.displayName,
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
