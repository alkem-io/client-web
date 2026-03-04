import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PollEmptyState = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {t('poll.results.noVotes')}
      </Typography>
    </Box>
  );
};

export default PollEmptyState;
