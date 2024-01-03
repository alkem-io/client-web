import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { addOpportunityUrl } from '../../../../../main/routing/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import { Caption } from '../../../../../core/ui/typography';
import ActivityDescriptionByType from '../../ActivityDescription/ActivityDescriptionByType';

interface ActivityOpportunityCreatedViewProps extends ActivityViewProps {
  opportunity: NameableEntity;
}

export const ActivityOpportunityCreatedView: FC<ActivityOpportunityCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyUrl,
  journeyDisplayName,
  opportunity,
}) => {
  const { t } = useTranslation();

  const description = t('components.activity-log-view.activity-description.opportunity-created', {
    displayName: opportunity.profile.displayName,
  });

  const url = addOpportunityUrl(journeyUrl, opportunity.nameID);

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      title={
        <ActivityDescriptionByType
          activityType="opportunity-created"
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
