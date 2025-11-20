import { Box, Button, Typography, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';

interface GuestSessionNotificationProps {
  onBackToWhiteboard: () => void;
  onGoToWebsite: () => void;
}

const GuestSessionNotification = ({ onBackToWhiteboard, onGoToWebsite }: GuestSessionNotificationProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        width: '100%',
        p: 5,
        backgroundColor: 'background.paper',
        borderRadius: '14px',
        boxShadow:
          '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
      }}
    >
      {/* Title */}
      <Typography
        variant="h3"
        sx={{
          fontSize: 40,
          fontWeight: 500,
          lineHeight: '40px',
          letterSpacing: '-0.625px',
          textAlign: 'left',
        }}
      >
        {t('pages.public.whiteboard.guestSessionNotification.title')}
      </Typography>

      {/* Content Container */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            fontSize: 14,
            lineHeight: '20px',
            color: 'text.secondary',
          }}
        >
          {t('pages.public.whiteboard.guestSessionNotification.description')}
        </Typography>

        {/* Buttons Container */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Back to Whiteboard Button */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<ArrowBackIcon sx={{ fontSize: '16px' }} />}
            onClick={onBackToWhiteboard}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              textTransform: 'uppercase',
              fontSize: 12,
              fontWeight: 500,
              lineHeight: '20px',
              py: 1,
              px: 14.375,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            {t('pages.public.whiteboard.guestSessionNotification.backButton')}
          </Button>

          {/* Go to Website Button */}
          <Button
            variant="outlined"
            fullWidth
            onClick={onGoToWebsite}
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
              borderWidth: '1.111px',
              color: theme.palette.text.primary,
              textTransform: 'uppercase',
              fontSize: 12,
              fontWeight: 500,
              lineHeight: '20px',
              py: 1,
              px: 14.5,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                borderColor: theme.palette.divider,
              },
            }}
          >
            {t('pages.public.whiteboard.guestSessionNotification.websiteButton')}
          </Button>

          {/* Info Box */}
          <Box
            sx={{
              backgroundColor: theme.palette.info.main,
              borderRadius: '10px',
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {/* Contribute More Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.25 }}>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: '20px',
                  textAlign: 'center',
                }}
              >
                {t('pages.public.whiteboard.guestSessionNotification.contributeMoreTitle')}
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: '16px' }} />
            </Box>

            {/* Contribute More Description */}
            <Typography
              variant="body1"
              sx={{
                fontSize: 14,
                lineHeight: '20px',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              {t('pages.public.whiteboard.guestSessionNotification.contributeMoreDescription')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GuestSessionNotification;
