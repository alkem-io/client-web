import { FC } from 'react';
import CardImage from '@/core/ui/card/CardImage';
import { TemplateCardProps } from './TemplateCard';
import { SpaceTemplate } from '@/domain/templates/models/SpaceTemplate';
import TemplateCardLayout from './TemplateCardLayout';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { Box } from '@mui/material';

interface SpaceTemplateCardProps extends TemplateCardProps {
  template: SpaceTemplate;
}

const SpaceTemplateCard: FC<SpaceTemplateCardProps> = ({ template, innovationPack, loading, ...props }) => {
  return (
    <TemplateCardLayout
      templateName={template?.profile.displayName}
      innovationPack={innovationPack}
      tags={template?.profile.defaultTagset?.tags ?? []}
      loading={loading}
      {...props}
    >
      <CardImage
        src={template?.contentSpace?.about?.profile?.cardBanner?.uri}
        defaultImage={
          <Box
            component="img"
            display="block"
            width="100%"
            sx={{ aspectRatio: '16 / 9', objectFit: 'cover' }}
            src={getDefaultSpaceVisualUrl(VisualType.Card, template?.contentSpace?.id)}
          />
        }
        alt={template?.profile.displayName}
      />
    </TemplateCardLayout>
  );
};

export default SpaceTemplateCard;
