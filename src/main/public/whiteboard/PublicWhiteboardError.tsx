import { FC } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export interface PublicWhiteboardErrorProps {
  error: Error;
  onRetry?: () => void;
}

/**
 * Error component for public whiteboard page
 * Displays user-friendly error messages for different error types
 */
const PublicWhiteboardError: FC<PublicWhiteboardErrorProps> = ({ error, onRetry }) => {
  const { t } = useTranslation();

  // Determine error type and message
  const getErrorMessage = () => {
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes('404') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('403') ||
      errorMessage.includes('forbidden') ||
      errorMessage.includes('not available')
    ) {
      return {
        title: t('pages.public.whiteboard.error.404.title', 'Whiteboard Not Found'),
        message: t(
          'pages.public.whiteboard.error.404.message',
          'The whiteboard link may be incorrect or the whiteboard may have been deleted.'
        ),
      };
    }

    return {
      title: t('pages.public.whiteboard.error.500.title', 'Unable to Load Whiteboard'),
      message: t(
        'pages.public.whiteboard.error.500.message',
        'Please try again later or check your internet connection.'
      ),
    };
  };

  const { title, message } = getErrorMessage();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      padding={3}
      textAlign="center"
    >
      <ErrorOutlineIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" maxWidth={600} mb={4}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="contained" onClick={onRetry}>
          {t('buttons.retry', 'Try Again')}
        </Button>
      )}
    </Box>
  );
};

export default PublicWhiteboardError;
