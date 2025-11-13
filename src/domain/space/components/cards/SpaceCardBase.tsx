import React, { PropsWithChildren, ReactNode, ReactElement } from 'react';
import { Box } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import ContributeCard, { ContributeCardProps } from '@/core/ui/card/ContributeCard';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { gutters } from '@/core/ui/grid/utils';
import CardContent from '@/core/ui/card/CardContent';
import RouterLink from '@/core/ui/link/RouterLink';
import CardBanner from '@/core/ui/card/CardImageHeader';
import { useTranslation } from 'react-i18next';
import { SpaceCardBanner } from './components/SpaceCardBanner';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import CardTags from '@/core/ui/card/CardTags';

export interface SpaceCardProps extends ContributeCardProps {
  header: ReactNode;
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

  return (
    <ContributeCard sx={{ position: 'relative' }} {...containerProps}>
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
