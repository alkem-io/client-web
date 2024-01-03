import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildWhiteboardUrl } from '../../../../../main/routing/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import { Caption } from '../../../../../core/ui/typography';
import ActivityDescriptionByType from '../../ActivityDescription/ActivityDescriptionByType';
import { ActivityCalloutValues } from '../../../types/ActivityCalloutValues';

interface ActivityCalloutWhiteboardCreatedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  whiteboard: NameableEntity;
}

export const ActivityCalloutWhiteboardCreatedView: FC<ActivityCalloutWhiteboardCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyUrl,
  journeyDisplayName,
  callout,
  whiteboard,
}) => {
  const { t } = useTranslation();

  const description = t('components.activity-log-view.activity-description.whiteboard-created', {
    displayName: whiteboard.profile.displayName,
  });

  const url = buildWhiteboardUrl(callout.nameID, whiteboard.nameID, journeyUrl);

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      title={
        <ActivityDescriptionByType
          activityType="whiteboard-created"
          {...{
            author,
            createdDate,
            journeyTypeName,
            journeyUrl,
            journeyDisplayName,
            values: {
              calloutDisplayName: callout.framing.profile.displayName,
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
