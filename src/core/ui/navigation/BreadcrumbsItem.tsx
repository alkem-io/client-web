import { Avatar, CircularProgress, Collapse, Paper, SvgIconProps, useTheme } from '@mui/material';
import RouterLink from '../link/RouterLink';
import { gutters } from '../grid/utils';
import SwapColors from '../palette/SwapColors';
import { CardText } from '../typography';
import { Expandable } from './Expandable';
import { ComponentType } from 'react';
import { useElevationContext } from '../utils/ElevationContext';
import { useTranslation } from 'react-i18next';

export interface BreadcrumbsItemProps extends Expandable {
  avatar?: {
    uri?: string;
    name?: string;
  };
  iconComponent?: ComponentType<SvgIconProps>;
  uri?: string;
  accent?: boolean;
  children: string | undefined;
  loading?: boolean;
}

const AVATAR_SIZE_GUTTERS = 0.9;

const BreadcrumbsItem = ({
  avatar,
  uri,
  iconComponent: Icon,
  expanded = false,
  onExpand,
  onCollapse,
  accent = false,
  loading = false,
  children,
}: BreadcrumbsItemProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Paper
      component={uri ? RouterLink : Paper}
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
      onFocus={() => onExpand?.()}
      onBlur={() => onCollapse?.()}
      {...(uri ? { 'aria-label': children } : {})}
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
        alt={avatar?.name ? t('common.avatar-of', { user: avatar?.name }) : t('common.avatar')}
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
