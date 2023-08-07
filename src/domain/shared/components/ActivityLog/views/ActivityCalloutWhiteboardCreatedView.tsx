import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildWhiteboardUrl } from '../../../../../common/utils/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import { Caption } from '../../../../../core/ui/typography';
import ActivityDescriptionByType from '../../ActivityDescription/ActivityDescriptionByType';

interface ActivityCalloutWhiteboardCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  whiteboard: NameableEntity;
}

export const ActivityCalloutWhiteboardCreatedView: FC<ActivityCalloutWhiteboardCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyLocation,
  journeyDisplayName,
  callout,
  whiteboard,
}) => {
  const { t } = useTranslation();

  const description = t('components.activity-log-view.activity-description.whiteboard-created', {
    displayName: whiteboard.profile.displayName,
    interpolation: {
      escapeValue: false,
    },
  });

  const url = buildWhiteboardUrl(callout.nameID, whiteboard.nameID, journeyLocation);

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
