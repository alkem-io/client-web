import { Box, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { generateSupportMailtoUrl } from './generateSupportMailtoUrl';

type ErrorNotificationContentProps = {
  message: string;
  numericCode?: number;
};

/**
 * Content component for error notifications that includes the error message
 * and a "Contact Support" link below it.
 */
export const ErrorNotificationContent = ({ message, numericCode }: ErrorNotificationContentProps) => {
  const { t } = useTranslation();
  const mailtoUrl = generateSupportMailtoUrl({ numericCode, t });

  return (
    <Box>
      <Typography variant="body2" component="div">
        {message}
      </Typography>
      {numericCode !== undefined && (
        <Typography variant="body2" component="div" sx={{ opacity: 0.8 }}>
          {t('apollo.errors.support.errorCode', { code: numericCode })}
        </Typography>
      )}
      <Link
        href={mailtoUrl}
        variant="body2"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          // Explicitly open mailto to ensure it works inside Snackbar
          window.location.href = mailtoUrl;
        }}
        sx={{
          display: 'block',
          marginTop: 0.5,
          color: 'inherit',
          textDecoration: 'underline',
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'none',
          },
        }}
      >
        {t('apollo.errors.support.linkText')}
      </Link>
    </Box>
  );
};
