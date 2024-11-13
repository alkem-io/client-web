import { ComponentType, PropsWithChildren, ReactNode, useState } from 'react';
import { Box, SvgIconProps } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import ContributeCard, { ContributeCardProps } from '@core/ui/card/ContributeCard';
import BadgeCardView from '@core/ui/list/BadgeCardView';
import RoundedIcon from '@core/ui/icon/RoundedIcon';
import { gutters } from '@core/ui/grid/utils';
import CardContent from '@core/ui/card/CardContent';
import RouterLink from '@core/ui/link/RouterLink';
import ExpandableCardFooter from '@core/ui/card/ExpandableCardFooter';
import CardBanner from '@core/ui/card/CardImageHeader';
import { useTranslation } from 'react-i18next';
import { JourneyCardBanner } from './Banner';
import defaultCardBanner from '../../defaultVisuals/Card.jpg';
import CardTags from '@core/ui/card/CardTags';

export interface JourneyCardProps extends ContributeCardProps {
  iconComponent: ComponentType<SvgIconProps>;
  header: ReactNode;
  banner?: JourneyCardBanner;
  tags?: string[];
  journeyUri?: string;
  expansion?: ReactNode;
  expansionActions?: ReactNode;
  bannerOverlay?: ReactNode;
  member?: boolean;
  locked?: boolean;
  actions?: ReactNode;
  matchedTerms?: boolean; // TODO pass ComponentType<CardTags> instead
  visual?: ReactNode;
}

const JourneyCard = ({
  iconComponent: Icon,
  header,
  banner,
  tags,
  journeyUri,
  expansion,
  expansionActions,
  bannerOverlay,
  member,
  locked,
  actions,
  children,
  visual,
  ...containerProps
}: PropsWithChildren<JourneyCardProps>) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const canBeExpanded = !!expansion;

  const toggleExpanded = () => setIsExpanded(wasExpanded => !wasExpanded);

  const wrapperProps =
    journeyUri && !containerProps.onClick
      ? ({
          component: RouterLink,
          to: journeyUri,
        } as const)
      : {};

  return (
    <ContributeCard sx={{ position: 'relative' }} {...containerProps}>
      <Box {...wrapperProps}>
        <CardBanner
          src={banner?.uri || defaultCardBanner}
          alt={t('visuals-alt-text.banner.card.text', { altText: banner?.alternativeText })}
          overlay={bannerOverlay}
        />
        <BadgeCardView
          visual={visual || <RoundedIcon size="small" component={Icon} />}
          visualRight={locked ? <LockOutlined fontSize="small" color="primary" /> : undefined}
          gap={1}
          height={gutters(3)}
          paddingY={1}
          paddingX={1.5}
        >
          {header}
        </BadgeCardView>
      </Box>
      <Box onClick={canBeExpanded ? toggleExpanded : undefined} sx={{ cursor: 'pointer' }} paddingBottom={1}>
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

export default JourneyCard;
