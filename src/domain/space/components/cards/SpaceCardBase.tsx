import React, { ComponentType, PropsWithChildren, ReactNode, useState } from 'react';
import { Box, SvgIconProps } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import ContributeCard, { ContributeCardProps } from '@/core/ui/card/ContributeCard';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import { gutters } from '@/core/ui/grid/utils';
import CardContent from '@/core/ui/card/CardContent';
import RouterLink from '@/core/ui/link/RouterLink';
import ExpandableCardFooter from '@/core/ui/card/ExpandableCardFooter';
import CardBanner from '@/core/ui/card/CardImageHeader';
import { useTranslation } from 'react-i18next';
import { SpaceCardBanner } from './components/SpaceCardBanner';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import CardTags from '@/core/ui/card/CardTags';
import { SpaceL0Icon } from '../../icons/SpaceL0Icon';

export interface SpaceCard2Props extends ContributeCardProps {
  iconComponent: ComponentType<SvgIconProps>;
  header: ReactNode;
  banner?: SpaceCardBanner;
  tags?: string[];
  spaceUri?: string;
  expansion?: ReactNode;
  expansionActions?: ReactNode;
  bannerOverlay?: ReactNode;
  member?: boolean;
  locked?: boolean;
  actions?: ReactNode;
  matchedTerms?: boolean; // TODO pass ComponentType<CardTags> instead
  visual?: ReactNode;
  spaceId?: string;
}

const SpaceCardBase = ({
  iconComponent: Icon = SpaceL0Icon,
  header,
  banner,
  tags,
  spaceUri,
  expansion,
  expansionActions,
  bannerOverlay,
  member,
  locked,
  actions,
  children,
  visual,
  ...containerProps
}: PropsWithChildren<SpaceCard2Props>) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const canBeExpanded = !!expansion;

  const toggleExpanded = () => setIsExpanded(wasExpanded => !wasExpanded);

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
          visual={visual && React.isValidElement(visual) ? visual : <RoundedIcon size="small" component={Icon} />}
          visualRight={locked ? <LockOutlined fontSize="small" color="primary" /> : undefined}
          gap={1}
          height={gutters(3)}
          paddingY={1}
          paddingX={1.5}
        >
          {header}
        </BadgeCardView>
      </Box>
      <Box
        onClick={canBeExpanded ? toggleExpanded : undefined}
        sx={{ cursor: containerProps.onClick || containerProps.to ? 'pointer' : 'default' }}
        paddingBottom={1}
      >
        <CardContent flexGrow={1}>{children}</CardContent>
        <ExpandableCardFooter
          expanded={isExpanded}
          expandable={canBeExpanded}
          expansion={expansion}
          actions={actions}
          expansionActions={expansionActions}
          tags={tags && <CardTags disableIndentation tags={tags} />}
        />
      </Box>
    </ContributeCard>
  );
};

export default SpaceCardBase;
