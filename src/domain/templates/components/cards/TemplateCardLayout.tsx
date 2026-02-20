import { PropsWithChildren } from 'react';
import { Box, Skeleton } from '@mui/material';
import ContributeCard, { ContributeCardProps } from '@/core/ui/card/ContributeCard';
import CardHeader from '@/core/ui/card/CardHeader';
import CardHeaderCaption from '@/core/ui/card/CardHeaderCaption';
import CardSegmentCaption from '@/core/ui/card/CardSegmentCaption';
import CardTags from '@/core/ui/card/CardTags';
import { BlockTitle, Caption } from '@/core/ui/typography';
import InnovationPackIcon from '@/domain/InnovationPack/InnovationPackIcon';
import { CARD_BANNER_GRADIENT } from '@/core/ui/card/CardImageHeader';
import { TemplateInnovationPack } from '@/domain/templates/models/TemplateBase';
import SwapColors from '@/core/ui/palette/SwapColors';

const CONTENT_HEIGHT = 120;
const COMPACT_HEADER_HEIGHT = 60;

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
  const hasProvider = !!innovationPack?.provider?.profile;
  const hasFooter = !!innovationPack?.profile.displayName;

  return (
    <ContributeCard {...cardProps}>
      {hasProvider ? (
        <CardHeader title={templateName} contrast={isSelected}>
          {loading && <Skeleton />}
          <CardHeaderCaption logoUrl={innovationPack.provider!.profile.avatar?.uri} contrast={isSelected}>
            {innovationPack.provider!.profile.displayName}
          </CardHeaderCaption>
        </CardHeader>
      ) : (
        <SwapColors swap={!!isSelected}>
          <Box
            flexShrink={0}
            display="flex"
            alignItems="center"
            height={COMPACT_HEADER_HEIGHT}
            paddingX={1.5}
            sx={theme => ({
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: isSelected ? theme.palette.primary.main : undefined,
            })}
          >
            <BlockTitle
              display="-webkit-box"
              sx={{ WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' }}
              textOverflow="ellipsis"
              overflow="hidden"
              fontWeight={isSelected ? 'bold' : undefined}
              color="textPrimary"
            >
              {templateName}
            </BlockTitle>
          </Box>
        </SwapColors>
      )}
      <Box position="relative" overflow="hidden" height={CONTENT_HEIGHT} sx={{ backgroundColor: 'background.default' }}>
        {children}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: CARD_BANNER_GRADIENT,
            pointerEvents: 'none',
          }}
        />
        {tags.length > 0 && (
          <Box position="absolute" bottom={8} left={0} right={0}>
            <CardTags tags={tags} hideIfEmpty />
          </Box>
        )}
      </Box>
      {hasFooter && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{innovationPack!.profile.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default TemplateCardLayout;
