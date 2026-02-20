import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { Skeleton } from '@mui/material';
import ContributeCard, { ContributeCardProps } from '@/core/ui/card/ContributeCard';
import CardHeader from '@/core/ui/card/CardHeader';
import CardHeaderCaption from '@/core/ui/card/CardHeaderCaption';
import CardSegmentCaption from '@/core/ui/card/CardSegmentCaption';
import CardTags from '@/core/ui/card/CardTags';
import { Caption } from '@/core/ui/typography';
import InnovationPackIcon from '@/domain/InnovationPack/InnovationPackIcon';
import { CARD_BANNER_GRADIENT } from '@/core/ui/card/CardImageHeader';
import { TemplateInnovationPack } from '@/domain/templates/models/TemplateBase';

const CONTENT_HEIGHT = 120;
const GRADIENT_HEIGHT_PERCENT = '45%';

interface TemplateCardLayoutProps extends ContributeCardProps {
  templateName?: string;
  innovationPack?: TemplateInnovationPack;
  tags?: string[];
  loading?: boolean;
  isSelected?: boolean;
}

const TemplateCardLayout = ({
  templateName,
  innovationPack,
  tags = [],
  loading,
  isSelected,
  children,
  ...cardProps
}: PropsWithChildren<TemplateCardLayoutProps>) => {
  return (
    <ContributeCard {...cardProps}>
      <CardHeader title={templateName} contrast={isSelected}>
        {loading && <Skeleton />}
        <CardHeaderCaption logoUrl={innovationPack?.provider?.profile.avatar?.uri} contrast={isSelected}>
          {innovationPack?.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <Box position="relative" overflow="hidden" height={CONTENT_HEIGHT} sx={{ backgroundColor: 'background.default' }}>
        {children}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: GRADIENT_HEIGHT_PERCENT,
            background: CARD_BANNER_GRADIENT,
            pointerEvents: 'none',
          }}
        />
        {tags.length > 0 && (
          <Box position="absolute" bottom={0} left={0} right={0}>
            <CardTags tags={tags} hideIfEmpty />
          </Box>
        )}
      </Box>
      {innovationPack?.profile.displayName && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{innovationPack.profile.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default TemplateCardLayout;
