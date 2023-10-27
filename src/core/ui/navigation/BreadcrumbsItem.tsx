import { Avatar, CircularProgress, Collapse, Paper, SvgIconProps, useTheme } from '@mui/material';
import RouterLink from '../link/RouterLink';
import { gutters } from '../grid/utils';
import SwapColors from '../palette/SwapColors';
import { CardText } from '../typography';
import { Expandable } from './Expandable';
import { ComponentType, PropsWithChildren } from 'react';
import { useElevationContext } from '../utils/ElevationContext';

interface BreadcrumbsItemProps extends Expandable {
  avatar?: {
    uri?: string;
  };
  iconComponent?: ComponentType<SvgIconProps>;
  uri: string;
  accent?: boolean;
  loading?: boolean;
}

const AVATAR_SIZE_GUTTERS = 0.9;

const BreadcrumbsItem = ({
  avatar,
  uri,
  iconComponent: Icon,
  expanded = false,
  onExpand,
  accent = false,
  loading = false,
  children,
}: PropsWithChildren<BreadcrumbsItemProps>) => {
  const theme = useTheme();

  return (
    <Paper
      component={RouterLink}
      to={uri}
      elevation={useElevationContext()}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        height: gutters(),
        paddingX: gutters((1 - AVATAR_SIZE_GUTTERS) / 2),
        paddingY: gutters((1 - AVATAR_SIZE_GUTTERS) / 2),
        borderRadius: 0.5,
      }}
      onMouseEnter={() => onExpand?.()}
    >
      <Avatar
        src={avatar?.uri}
        sx={{
          width: gutters(AVATAR_SIZE_GUTTERS),
          height: gutters(AVATAR_SIZE_GUTTERS),
          fontSize: gutters(0.6),
          borderRadius: 0.4,
          backgroundColor: accent ? 'primary.main' : 'transparent',
        }}
      >
        {loading && <CircularProgress size={gutters(0.6)(theme)} />}
        {!loading && <SwapColors swap={accent}>{Icon && <Icon fontSize="inherit" color="primary" />}</SwapColors>}
      </Avatar>
      <Collapse in={expanded} orientation="horizontal">
        <CardText paddingX={0.5} lineHeight={gutters(AVATAR_SIZE_GUTTERS)} maxWidth="30vw" color="primary" noWrap>
          {children}
        </CardText>
      </Collapse>
    </Paper>
  );
};

export default BreadcrumbsItem;
