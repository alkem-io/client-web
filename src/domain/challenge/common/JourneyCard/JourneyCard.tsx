import React, { ComponentType, PropsWithChildren, ReactNode, useState } from 'react';
import ContributeCard, { ContributeCardContainerProps } from '../../../../core/ui/card/ContributeCard';
import { Box, Collapse, SvgIconProps } from '@mui/material';
import CardImage from '../../../../core/ui/card/CardImage';
import ItemView from '../../../../core/ui/list/ItemView';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { gutters } from '../../../../core/ui/grid/utils';
import CardContent from '../../../../core/ui/card/CardContent';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { Add, ArrowForward, BeenhereOutlined, ExpandLess, ExpandMore } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { JourneyTypeName } from '../../JourneyTypeName';
import JourneyCardExpansionActions from './JourneyCardExpansionActions';
import JourneyCardExpansionButton from './JourneyCardExpansionButton';

export interface JourneyCardProps extends ContributeCardContainerProps {
  iconComponent: ComponentType<SvgIconProps>;
  header: ReactNode;
  tagline: string;
  bannerUri: string;
  tags: string[];
  journeyUri: string;
  expansion?: ReactNode;
  journeyTypeName: JourneyTypeName;
  member?: boolean;
}

const JourneyCard = ({
  iconComponent: Icon,
  header,
  tagline,
  bannerUri,
  tags,
  journeyUri,
  expansion,
  journeyTypeName,
  member,
  children,
  ...containerProps
}: PropsWithChildren<JourneyCardProps>) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(wasExpanded => !wasExpanded);

  const { t } = useTranslation();

  return (
    <ContributeCard {...containerProps}>
      <Box component={RouterLink} to={journeyUri}>
        <Box position="relative">
          <CardImage src={bannerUri} alt={tagline} />
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
          gap={1}
          height={gutters(3)}
          paddingY={1}
          paddingX={1.5}
        >
          {header}
        </ItemView>
      </Box>
      <Box onClick={toggleExpanded} sx={{ cursor: 'pointer' }} paddingBottom={1}>
        <CardContent flexGrow={1}>{children}</CardContent>
        <Box
          flexGrow={1}
          display="flex"
          justifyContent="space-between"
          alignItems="end"
          height={gutters(1.5)}
          paddingLeft={1.5}
          paddingRight={1}
        >
          <TagsComponent
            tags={tags}
            variant="filled"
            height={gutters()}
            color="primary"
            visibility={isExpanded ? 'hidden' : 'visible'}
          />
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </Box>
        <Collapse in={isExpanded}>
          <CardContent>
            {expansion}
            <TagsComponent tags={tags} variant="filled" height={gutters(2.5)} marginTop={0.5} color="primary" />
            <JourneyCardExpansionActions>
              <JourneyCardExpansionButton startIcon={<ArrowForward />}>
                {t('buttons.go-to-entity', { entity: t(`common.${journeyTypeName}` as const) })}
              </JourneyCardExpansionButton>
              <JourneyCardExpansionButton startIcon={<Add />} variant="outlined">
                {t('components.application-button.join')}
              </JourneyCardExpansionButton>
            </JourneyCardExpansionActions>
          </CardContent>
        </Collapse>
      </Box>
    </ContributeCard>
  );
};

export default JourneyCard;
