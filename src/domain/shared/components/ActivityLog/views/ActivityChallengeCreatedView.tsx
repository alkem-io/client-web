import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { addChallengeUrl } from '../../../../../main/routing/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import { Caption } from '../../../../../core/ui/typography';
import ActivityDescriptionByType from '../../ActivityDescription/ActivityDescriptionByType';

interface ActivityChallengeCreatedViewProps extends ActivityViewProps {
  challenge: NameableEntity;
}

export const ActivityChallengeCreatedView: FC<ActivityChallengeCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyUrl,
  journeyDisplayName,
  challenge,
}) => {
  const { t } = useTranslation();

  const description = t('components.activity-log-view.activity-description.challenge-created', {
    displayName: challenge.profile.displayName,
  });

  const url = addChallengeUrl(journeyUrl, challenge.nameID);

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      title={
        <ActivityDescriptionByType
          activityType="challenge-created"
          {...{
            author,
            createdDate,
            journeyTypeName,
            journeyUrl,
            journeyDisplayName,
          }}
          withLinkToParent={Boolean(journeyTypeName)}
        />
      }
      url={url}
    >
      <Caption>{description}</Caption>
    </ActivityBaseView>
  );
};
