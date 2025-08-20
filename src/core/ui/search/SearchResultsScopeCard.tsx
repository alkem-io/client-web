import { Box, Chip, CircularProgress, SvgIconProps, useTheme } from '@mui/material';
import Avatar from '../avatar/Avatar';
import { gutters } from '../grid/utils';
import SwapColors from '../palette/SwapColors';
import { CardText } from '../typography';
import { ComponentType, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

const AVATAR_SIZE_GUTTERS = 0.9;

type SearchResultsScopeCardProps = {
  avatar?: {
    uri?: string;
    name?: string;
  };
  iconComponent?: ComponentType<SvgIconProps>;
  accent?: boolean;
  loading?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
};

const SearchResultsScopeCard = ({
  avatar,
  iconComponent: Icon,
  accent = false,
  loading = false,
  onClick,
  onDelete,
  children,
}: PropsWithChildren<SearchResultsScopeCardProps>) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Chip
      variant="outlined"
      sx={{
        height: gutters(1.5),
        borderRadius: theme => `${theme.shape.borderRadius}px`,
        cursor: onClick ? 'pointer' : 'auto',
        '.MuiChip-deleteIcon': {
          color: theme.palette.primary.main,
        },
      }}
      onClick={onClick}
      onDelete={onDelete}
      label={
        <Box display="flex" alignItems="center">
          <Avatar
            src={avatar?.uri}
            sx={{
              width: gutters(AVATAR_SIZE_GUTTERS),
              height: gutters(AVATAR_SIZE_GUTTERS),
              fontSize: gutters(0.6),
              borderRadius: 0.4,
              backgroundColor: accent ? 'primary.main' : 'transparent',
            }}
            alt={t('common.avatar-of', { user: avatar?.name })}
          >
            {loading && <CircularProgress size={gutters(0.6)(theme)} />}
            {!loading && <SwapColors swap={accent}>{Icon && <Icon fontSize="inherit" color="primary" />}</SwapColors>}
          </Avatar>
          <CardText paddingX={0.5} lineHeight={gutters(AVATAR_SIZE_GUTTERS)} maxWidth="30vw" color="primary" noWrap>
            {children}
          </CardText>
        </Box>
      }
    />
  );
};

export default SearchResultsScopeCard;
