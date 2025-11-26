import React from 'react';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import { TemplateCardProps } from './TemplateCard';
import { SpaceTemplate } from '@/domain/templates/models/SpaceTemplate';

interface SpaceTemplateCardProps extends TemplateCardProps {
  template: SpaceTemplate;
}

const SpaceTemplateCard = ({ template, loading, ...props }: SpaceTemplateCardProps) => {
  if (loading || !template) {
    return <SpaceCard displayName="" {...props} />;
  }

  // todo: we don't have the contentSpace data available
  return (
    <SpaceCard
      spaceId={template.id}
      displayName={template.profile.displayName}
      banner={template.contentSpace?.about?.profile?.cardBanner}
      isPrivate={template.contentSpace?.about?.isContentPublic === false}
      {...props}
    />
  );
};

export default SpaceTemplateCard;
