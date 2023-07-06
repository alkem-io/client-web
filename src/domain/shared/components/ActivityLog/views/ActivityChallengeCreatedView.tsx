import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildChallengeUrl } from '../../../../../common/utils/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import { Caption } from '../../../../../core/ui/typography';
import useActivityViewParams from './useActivityViewParams';
import ActivityDescription from '../../ActivityDescription/ActivityDescription';

export interface ActivityChallengeCreatedViewProps extends ActivityViewProps {
  challenge: NameableEntity;
}

export const ActivityChallengeCreatedView: FC<ActivityChallengeCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyLocation,
  parentDisplayName,
  challenge,
}) => {
  const { t } = useTranslation();

  const description = t('components.activity-log-view.activity-description.challenge-created', {
    displayName: challenge.profile.displayName,
    interpolation: {
      escapeValue: false,
    },
  });
  const url = buildChallengeUrl(journeyLocation.spaceNameId, challenge.nameID!);

  const { i18nKey, values, components } = useActivityViewParams({
    activityType: 'challenge-created',
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
      <Caption>{description}</Caption>
    </ActivityBaseView>
  );
};
