import React, { ComponentType, PropsWithChildren, ReactNode, useState } from 'react';
import { Box, Collapse, SvgIconProps } from '@mui/material';
import { BeenhereOutlined, ExpandLess, ExpandMore, LockOutlined } from '@mui/icons-material';
import ContributeCard, { ContributeCardContainerProps } from '../../../../core/ui/card/ContributeCard';
import CardImage from '../../../../core/ui/card/CardImage';
import ItemView from '../../../../core/ui/list/ItemView';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import CardTags from '../../../../core/ui/card/CardTags';
import { gutters } from '../../../../core/ui/grid/utils';
import CardContent from '../../../../core/ui/card/CardContent';
import RouterLink from '../../../../core/ui/link/RouterLink';
import JourneyCardBannerPlaceholder from './JourneyCardBannerPlaceholder';

export interface JourneyCardProps extends ContributeCardContainerProps {
  iconComponent: ComponentType<SvgIconProps>;
  header: ReactNode;
  tagline: string;
  bannerUri?: string;
  tags: string[];
  journeyUri: string;
  expansion?: ReactNode;
  expansionActions?: ReactNode;
  member?: boolean;
  locked?: boolean;
  actions?: ReactNode;
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
  member,
  locked,
  actions,
  children,
  ...containerProps
}: PropsWithChildren<JourneyCardProps>) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const canBeExpanded = !!expansion;

  const toggleExpanded = () => setIsExpanded(wasExpanded => !wasExpanded);

  return (
    <ContributeCard {...containerProps}>
      <Box component={RouterLink} to={journeyUri}>
        <Box position="relative">
          {bannerUri ? <CardImage src={bannerUri} alt={tagline} /> : <JourneyCardBannerPlaceholder />}
          {member && (
            <RoundedIcon
              size="small"
              component={BeenhereOutlined}
              position="absolute"
              right={gutters(0.5)}
              top={gutters(0.5)}
            />
          )}
        </Box>
        <ItemView
          visual={<RoundedIcon size="small" component={Icon} />}
          visualRight={locked ? <LockOutlined fontSize="small" color="primary" /> : undefined}
          gap={1}
          height={gutters(3)}
          paddingY={1}
          paddingX={1.5}
        >
          {header}
        </ItemView>
      </Box>
      <Box onClick={canBeExpanded ? toggleExpanded : undefined} sx={{ cursor: 'pointer' }} paddingBottom={1}>
        <CardContent flexGrow={1}>{children}</CardContent>
        <Box
          flexGrow={1}
          display="flex"
          justifyContent="space-between"
          paddingX={1.5}
          flexWrap={actions ? 'wrap' : 'nowrap'}
        >
          <CardTags
            tags={tags}
            visibility={isExpanded ? 'hidden' : 'visible'}
            flexBasis={actions ? '100%' : undefined}
          />
          {actions}
          {canBeExpanded && (
            <Box display="flex" marginRight={-0.5} alignItems="end">
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </Box>
          )}
        </Box>
        <Collapse in={canBeExpanded && isExpanded}>
          <CardContent>
            {expansion}
            <CardTags tags={tags} rows={2} />
            {expansionActions}
          </CardContent>
        </Collapse>
      </Box>
    </ContributeCard>
  );
};

export default JourneyCard;
