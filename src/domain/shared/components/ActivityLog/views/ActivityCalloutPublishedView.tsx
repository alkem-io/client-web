import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { buildCalloutUrl } from '../../../../../main/routing/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { Caption } from '../../../../../core/ui/typography';
import ActivityDescriptionByType from '../../ActivityDescription/ActivityDescriptionByType';

interface ActivityCalloutPublishedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  calloutType: string;
}

export const ActivityCalloutPublishedView: FC<ActivityCalloutPublishedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyLocation,
  journeyDisplayName,
  callout,
  calloutType,
}) => {
  const { t } = useTranslation();

  const description = t('components.activity-log-view.activity-description.callout-published', {
    displayName: callout.profile.displayName,
    type: calloutType,
    interpolation: {
      escapeValue: false,
    },
  });
  const url = buildCalloutUrl(callout.nameID, journeyLocation);

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      title={
        <ActivityDescriptionByType
          activityType="callout-published"
          {...{
            author,
            createdDate,
            journeyTypeName,
            journeyLocation,
            journeyDisplayName,
            values: {
              calloutDisplayName: callout.profile.displayName,
            },
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
