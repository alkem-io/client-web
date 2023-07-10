import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildOpportunityUrl } from '../../../../../common/utils/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import { Caption } from '../../../../../core/ui/typography';
import useActivityViewParams from './useActivityViewParams';
import ActivityDescription from '../../ActivityDescription/ActivityDescription';

export interface ActivityOpportunityCreatedViewProps extends ActivityViewProps {
  opportunity: NameableEntity;
}

export const ActivityOpportunityCreatedView: FC<ActivityOpportunityCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyLocation,
  parentDisplayName,
  opportunity,
}) => {
  const { t } = useTranslation();

  const description = t('components.activity-log-view.activity-description.opportunity-created', {
    displayName: opportunity.profile.displayName,
    interpolation: {
      escapeValue: false,
    },
  });
  const url = buildOpportunityUrl(journeyLocation.spaceNameId, journeyLocation.challengeNameId!, opportunity.nameID!);

  const { i18nKey, values, components } = useActivityViewParams({
    activityType: 'opportunity-created',
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
