import React from 'react';
import SpaceTile from '@/domain/space/components/cards/SpaceTile';
import { TemplateCardProps } from './TemplateCard';
import { SpaceTemplate } from '@/domain/templates/models/SpaceTemplate';

interface SpaceTemplateCardProps extends TemplateCardProps {
  template: SpaceTemplate;
}

const SpaceTemplateCard = ({ template, loading, ...props }: SpaceTemplateCardProps) => {
  const spaceData = template
    ? {
        id: template.id,
        about: {
          profile: {
            displayName: template.profile.displayName,
            url: template.profile.url ?? '',
            cardBanner: template.contentSpace?.about?.profile?.visual,
          },
          isContentPublic: true,
        },
      }
    : undefined;

  return <SpaceTile space={loading ? undefined : spaceData} {...props} />;
};

export default SpaceTemplateCard;
