import React, { PropsWithChildren, ReactNode, ReactElement } from 'react';
import { Box } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import ContributeCard, { ContributeCardProps } from '@/core/ui/card/ContributeCard';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { gutters } from '@/core/ui/grid/utils';
import CardContent from '@/core/ui/card/CardContent';
import RouterLink from '@/core/ui/link/RouterLink';
import CardBanner, { CARD_BANNER_GRADIENT } from '@/core/ui/card/CardImageHeader';
import { useTranslation } from 'react-i18next';
import { SpaceCardBanner } from './components/SpaceCardBanner';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import CardTags from '@/core/ui/card/CardTags';

export const CARD_FOOTER_HEIGHT = gutters(3);

// Minimum card width to prevent content (avatar, title, tags) from collapsing on narrow viewports
const CARD_MIN_WIDTH = 230;

export interface SpaceCardProps extends ContributeCardProps {
  header: ReactNode | null;
  banner?: SpaceCardBanner;
  tags?: string[];
  spaceUri?: string;
  bannerOverlay?: ReactNode;
  member?: boolean;
  locked?: boolean;
  actions?: ReactNode;
  matchedTerms?: boolean; // TODO pass ComponentType<CardTags> instead
  visual?: ReactNode;
  spaceId?: string;
  iconOverlay?: ReactNode;
}

const SpaceCardBase = ({
  header,
  banner,
  tags,
  spaceUri,
  bannerOverlay,
  member,
  locked,
  actions,
  children,
  visual,
  iconOverlay,
  ...containerProps
}: PropsWithChildren<SpaceCardProps>) => {
  const { t } = useTranslation();

  const wrapperProps =
    spaceUri && !containerProps.onClick
      ? ({
          component: RouterLink,
          to: spaceUri,
        } as const)
      : {};

  // Compact tile mode - banner fills entire card, footer overlaid at bottom with BadgeCardView
  if (header === null) {
    return (
      <ContributeCard sx={{ position: 'relative', overflow: 'hidden', minWidth: CARD_MIN_WIDTH }} {...containerProps}>
        <Box {...wrapperProps} sx={{ position: 'relative', height: '100%' }}>
          <CardBanner
            src={banner?.uri || getDefaultSpaceVisualUrl(VisualType.Card, containerProps.spaceId)}
            alt={t('visuals-alt-text.banner.card.text', { altText: banner?.alternativeText })}
            overlay={bannerOverlay}
          />
          {iconOverlay && <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 1 }}>{iconOverlay}</Box>}
          {/* Gradient overlay on top of banner for smooth transition to footer */}
          <Box
            sx={{
              position: 'absolute',
              bottom: CARD_FOOTER_HEIGHT, // Height of the footer
              left: 0,
              right: 0,
              height: '25%', // height of the gradient
              background: CARD_BANNER_GRADIENT,
            }}
          />
          {/* Footer with BadgeCardView - overlaid at bottom */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <BadgeCardView
              visual={
                visual && React.isValidElement(visual)
                  ? (visual as ReactElement<{ sx: { flexShrink: number } }>)
                  : undefined
              }
              visualRight={locked ? <LockOutlined fontSize="small" color="primary" /> : undefined}
              gap={1}
              height={gutters(3)}
              paddingY={1}
              paddingX={1.5}
              sx={{
                backgroundColor: 'white',
                borderRadius: theme => ` 0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
              }}
            >
              {children}
            </BadgeCardView>
          </Box>
        </Box>
      </ContributeCard>
    );
  }

  // Regular mode - standard card layout with header and content
  return (
    <ContributeCard sx={{ position: 'relative', minWidth: CARD_MIN_WIDTH }} {...containerProps}>
      <Box {...wrapperProps}>
        <CardBanner
          src={banner?.uri || getDefaultSpaceVisualUrl(VisualType.Card, containerProps.spaceId)}
          alt={t('visuals-alt-text.banner.card.text', { altText: banner?.alternativeText })}
          overlay={bannerOverlay}
        />
        <BadgeCardView
          visual={
            visual && React.isValidElement(visual)
              ? (visual as ReactElement<{ sx: { flexShrink: number } }>)
              : undefined
          }
          visualRight={locked ? <LockOutlined fontSize="small" color="primary" /> : undefined}
          gap={1}
          height={gutters(3)}
          paddingY={1}
          paddingX={1.5}
        >
          {header}
        </BadgeCardView>
      </Box>
      <CardContent flexGrow={1} paddingBottom={1}>
        {children}
        {actions}
        {tags && <CardTags disableIndentation tags={tags} />}
      </CardContent>
    </ContributeCard>
  );
};

export default SpaceCardBase;
