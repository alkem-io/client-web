import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildWhiteboardUrl } from '../../../../../common/utils/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import { Caption } from '../../../../../core/ui/typography';
import useActivityViewParams from './useActivityViewParams';
import ActivityDescription from '../../ActivityDescription/ActivityDescription';

export interface ActivityWhiteboardCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  whiteboard: NameableEntity;
}

export const ActivityWhiteboardCreatedView: FC<ActivityWhiteboardCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  parentDisplayName,
  journeyLocation,
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

  const { i18nKey, values, components } = useActivityViewParams({
    activityType: 'whiteboard-created',
    author,
    createdDate,
    journeyTypeName,
    parentDisplayName,
    values: {
      calloutDisplayName: callout.profile.displayName,
    },
  });

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      title={<ActivityDescription i18nKey={i18nKey} values={values} components={components} />}
      url={url}
    >
      <Caption>{description}</Caption>
    </ActivityBaseView>
  );
};
