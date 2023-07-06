import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { buildCalloutUrl } from '../../../../../common/utils/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { Caption } from '../../../../../core/ui/typography';
import ActivityDescription from '../../ActivityDescription/ActivityDescription';
import useActivityViewParams from './useActivityViewParams';

export interface ActivityCalloutPublishedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  calloutType: string;
}

export const ActivityCalloutPublishedView: FC<ActivityCalloutPublishedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyDisplayName,
  journeyLocation,
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

  const { i18nKey, values, components } = useActivityViewParams({
    activityType: 'callout-published',
    author,
    createdDate,
    journeyTypeName,
    parentDisplayName: journeyDisplayName,
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
