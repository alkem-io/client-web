import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface GuestVisibilityBadgeProps {
  size?: 'default' | 'compact';
  className?: string;
  'data-testid'?: string;
}

const GuestVisibilityBadge = ({ size = 'default', className, ...rest }: GuestVisibilityBadgeProps) => {
  const { t } = useTranslation();

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      className={className}
      sx={theme => ({
        borderRadius: 999,
        border: `1px solid ${theme.palette.error.main}`,
        backgroundColor: alpha(theme.palette.error.main, 0.08),
        color: theme.palette.error.main,
        paddingY: size === 'compact' ? theme.spacing(0.25) : theme.spacing(0.5),
        paddingX: size === 'compact' ? theme.spacing(1) : theme.spacing(1.5),
        fontSize: size === 'compact' ? theme.typography.pxToRem(12) : theme.typography.pxToRem(13),
      })}
      {...rest}
    >
      <Box component={PublicOutlinedIcon} sx={{ fontSize: '1.1em' }} aria-hidden />
      <Typography variant="caption" component="span" color="inherit">
        {t('share-dialog.guest-access.visibility-warning')}
      </Typography>
    </Stack>
  );
};

export default GuestVisibilityBadge;
