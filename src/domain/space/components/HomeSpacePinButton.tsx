import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { Paper, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import RouterLink from '@/core/ui/link/RouterLink';

interface HomeSpacePinButtonProps {
  settingsUrl: string;
}

const HomeSpacePinButton = ({ settingsUrl }: HomeSpacePinButtonProps) => {
  const { t } = useTranslation();

  if (!settingsUrl) {
    return null;
  }

  return (
    <Tooltip title={t('pages.admin.user.homeSpace.pinButtonTooltip')} arrow={true}>
      <Paper
        component={RouterLink}
        to={settingsUrl}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: 0.5,
          textDecoration: 'none',
          '&:hover': {
            background: theme => theme.palette.background.paper,
            opacity: 0.9,
          },
        }}
        aria-label={t('pages.admin.user.homeSpace.title')}
      >
        <PushPinOutlinedIcon sx={{ fontSize: 14 }} color="primary" />
      </Paper>
    </Tooltip>
  );
};

export default HomeSpacePinButton;
