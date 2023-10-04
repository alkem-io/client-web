import { useJourneyBreadcrumbs } from './useJourneyBreadcrumbs';
import Breadcrumbs from '../../../../core/ui/navigation/Breadcrumbs';
import { Avatar, Box, Collapse, SvgIconProps } from '@mui/material';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { gutters } from '../../../../core/ui/grid/utils';
import { CardText } from '../../../../core/ui/typography';
import { BreadcrumbsItemProps } from '../../../../core/ui/navigation/BreadcrumbsItemProps';
import JourneyIcon from '../../../shared/components/JourneyIcon/JourneyIcon';
import useJourneyBreadcrumbsTopLevelItem from './useJourneyBreadcrumbsTopLevelItem';
import { ComponentType } from 'react';
import { ReactComponent as AlkemioLogo } from '../../../platform/Logo/Logo-Small.svg';
import { ROUTE_HOME } from '../../../platform/routes/constants';
import { useTranslation } from 'react-i18next';
import SwapColors from '../../../../core/ui/palette/SwapColors';

interface JourneyBreadcrumbsItemProps extends BreadcrumbsItemProps {
  displayName: string;
  avatar?: {
    uri?: string;
  };
  iconComponent?: ComponentType<SvgIconProps>;
  uri: string;
  accent?: boolean;
  loading?: boolean;
}

const AVATAR_SIZE_GUTTERS = 0.9;

const JourneyBreadcrumbsItem = ({
  displayName,
  avatar,
  uri,
  iconComponent: Icon,
  expanded = false,
  accent = false,
  onExpand,
}: JourneyBreadcrumbsItemProps) => {
  return (
    <Box
      component={RouterLink}
      to={uri}
      display="flex"
      flexDirection="row"
      height={gutters()}
      paddingX={gutters((1 - AVATAR_SIZE_GUTTERS) / 2)}
      paddingY={gutters((1 - AVATAR_SIZE_GUTTERS) / 2)}
      borderRadius={0.5}
      sx={{ backgroundColor: theme => theme.palette.background.paper }}
      onMouseEnter={() => onExpand?.()}
    >
      <Avatar
        src={avatar?.uri}
        sx={{
          width: gutters(AVATAR_SIZE_GUTTERS),
          height: gutters(AVATAR_SIZE_GUTTERS),
          fontSize: gutters(0.5),
          borderRadius: 0.5,
          backgroundColor: accent ? 'primary.main' : 'transparent',
        }}
      >
        <SwapColors swap={accent}>{Icon && <Icon fontSize="inherit" color="primary" />}</SwapColors>
      </Avatar>
      <Collapse in={expanded} orientation="horizontal">
        <CardText paddingX={0.5} lineHeight={gutters(AVATAR_SIZE_GUTTERS)} color="primary" noWrap>
          {displayName}
        </CardText>
      </Collapse>
    </Box>
  );
};

const Logo = () => <AlkemioLogo />;

const JourneyBreadcrumbs = () => {
  const { t } = useTranslation();
  const { profile, loading: isLoadingTopLevelItem } = useJourneyBreadcrumbsTopLevelItem();
  const { breadcrumbs } = useJourneyBreadcrumbs();

  const breadcrumbItems: (JourneyBreadcrumbsItemProps & { key: string })[] = [
    {
      key: '_topLevel',
      displayName: profile?.displayName ?? t('components.myDashboard'),
      avatar: profile?.avatar,
      iconComponent: profile ? undefined : Logo,
      uri: ROUTE_HOME,
      loading: isLoadingTopLevelItem,
    },
    ...breadcrumbs.map(({ journeyTypeName, ...item }) => ({
      key: journeyTypeName,
      iconComponent: JourneyIcon[journeyTypeName],
      accent: true,
      ...item,
    })),
  ];

  return (
    <Breadcrumbs>
      {breadcrumbItems.map(item => (
        <JourneyBreadcrumbsItem {...item} />
      ))}
    </Breadcrumbs>
  );
};

export default JourneyBreadcrumbs;
