import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { buildCalloutUrl } from '../../../../../main/routing/urlBuilders';
import { NameableEntity } from '../../../types/NameableEntity';
import OneLineMarkdown from '../../../../../core/ui/markdown/OneLineMarkdown';
import ActivityDescriptionByType from '../../ActivityDescription/ActivityDescriptionByType';

interface ActivityCalloutLinkCreatedViewProps extends ActivityViewProps {
  callout: NameableEntity;
  linkName: string;
  linkDescription: string;
}

export const ActivityCalloutLinkCreatedView: FC<ActivityCalloutLinkCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyLocation,
  journeyDisplayName,
  callout,
  linkName,
  linkDescription,
}) => {
  const { t } = useTranslation();

  const description = t('components.activity-log-view.activity-description.callout-link-created', {
    linkName: linkName,
    linkDescription: linkDescription,
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
          activityType="callout-link-created"
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
      <OneLineMarkdown>{description}</OneLineMarkdown>
    </ActivityBaseView>
  );
};
