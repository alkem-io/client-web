import React, { ComponentType, PropsWithChildren, ReactNode, useState } from 'react';
import { Box, SvgIconProps } from '@mui/material';
import { BeenhereOutlined, LockOutlined } from '@mui/icons-material';
import ContributeCard, { ContributeCardContainerProps } from '../../../../core/ui/card/ContributeCard';
import CardImage from '../../../../core/ui/card/CardImage';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import CardTags from '../../../../core/ui/card/CardTags';
import { gutters } from '../../../../core/ui/grid/utils';
import CardContent from '../../../../core/ui/card/CardContent';
import RouterLink from '../../../../core/ui/link/RouterLink';
import JourneyCardBannerPlaceholder from './JourneyCardBannerPlaceholder';
import CardMatchedTerms from '../../../../core/ui/card/CardMatchedTerms';
import ExpandableCardFooter from '../../../../core/ui/card/ExpandableCardFooter';

export interface JourneyCardProps extends ContributeCardContainerProps {
  iconComponent: ComponentType<SvgIconProps>;
  header: ReactNode;
  tagline: string;
  bannerUri?: string;
  tags: string[];
  journeyUri: string;
  expansion?: ReactNode;
  expansionActions?: ReactNode;
  ribbon?: ReactNode;
  member?: boolean;
  locked?: boolean;
  actions?: ReactNode;
  matchedTerms?: boolean; // TODO pass ComponentType<CardTags> instead
}

const JourneyCard = ({
  iconComponent: Icon,
  header,
  tagline,
  bannerUri,
  tags,
  journeyUri,
  expansion,
  expansionActions,
  ribbon,
  member,
  locked,
  actions,
  matchedTerms = false,
  children,
  ...containerProps
}: PropsWithChildren<JourneyCardProps>) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const canBeExpanded = !!expansion;

  const toggleExpanded = () => setIsExpanded(wasExpanded => !wasExpanded);

  const Tags = matchedTerms ? CardMatchedTerms : CardTags;

  return (
    <ContributeCard {...containerProps}>
      <Box component={RouterLink} to={journeyUri}>
        <Box position="relative">
          {ribbon}
          {bannerUri ? <CardImage src={bannerUri} alt={tagline} /> : <JourneyCardBannerPlaceholder />}
          {member && (
            <RoundedIcon
              size="small"
              component={BeenhereOutlined}
              position="absolute"
              right={gutters(0.5)}
              top={gutters(ribbon ? 2.0 : 0.5)}
            />
          )}
        </Box>
        <BadgeCardView
          visual={<RoundedIcon size="small" component={Icon} />}
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
          tagsComponent={Tags}
          tags={tags}
        />
      </Box>
    </ContributeCard>
  );
};

export default JourneyCard;
