import { LockOutlined } from '@mui/icons-material';
import { Paper } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';

type PrivacyIconProps = {
  size?: number;
  top?: number;
  right?: number;
  ariaLabel?: string;
};

export const PrivacyIcon = ({ top = 8, size = 8, right = 8, ariaLabel = 'Private space' }: PrivacyIconProps) => {
  return (
    <Paper
      elevation={3}
      sx={theme => ({
        position: 'absolute',
        zIndex: theme.zIndex.fab,
        top: theme.spacing(top / 10),
        right: theme.spacing(right / 10),

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        width: size,
        height: size,
        borderRadius: '50%',
        padding: gutters(0.7),
        backgroundColor: theme.palette.background.paper,
        opacity: 0.8,
      })}
      aria-label={ariaLabel}
    >
      <LockOutlined fontSize="small" color="primary" />
    </Paper>
  );
};
