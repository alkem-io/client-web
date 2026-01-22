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
    alternativeText?: string;
  };
  iconComponent?: ComponentType<SvgIconProps>;
  uri?: string;
  accent?: boolean;
  children: string | undefined;
  loading?: boolean;
  size?: 'medium' | 'large';
}

const AVATAR_SIZE_GUTTERS = 0.9;
const SIZE_MULTIPLIERS = {
  medium: 1,
  large: 2,
};

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
  size = 'medium',
}: BreadcrumbsItemProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const sizeMultiplier = SIZE_MULTIPLIERS[size];
  const avatarSize = AVATAR_SIZE_GUTTERS * sizeMultiplier;
  const isLarge = size === 'large';

  return (
    <Paper
      component={uri ? RouterLink : Paper}
      to={uri}
      elevation={useElevationContext()}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        height: gutters(sizeMultiplier),
        paddingX: gutters((1 - avatarSize) / 2),
        paddingY: gutters((1 - avatarSize) / 2),
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
          width: gutters(avatarSize * 1.2),
          height: isLarge ? undefined : gutters(avatarSize), // fixes the homepage avatar size
          fontSize: gutters(0.6 * sizeMultiplier),
          borderRadius: 0.4,
          backgroundColor: accent ? 'primary.main' : 'transparent',
        }}
        alt={avatar?.alternativeText || t('common.avatar')}
      >
        {loading && <CircularProgress size={gutters(0.6 * sizeMultiplier)(theme)} />}
        {!loading && <SwapColors swap={accent}>{Icon && <Icon fontSize="inherit" color="primary" />}</SwapColors>}
      </Avatar>
      <Collapse in={expanded} orientation="horizontal">
        <CardText paddingX={1} lineHeight={gutters(avatarSize)} maxWidth="30vw" color="primary" noWrap>
          {children}
        </CardText>
      </Collapse>
    </Paper>
  );
};

export default BreadcrumbsItem;
