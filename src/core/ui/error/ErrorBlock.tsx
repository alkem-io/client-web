import ReportGmailerrorred from '@mui/icons-material/ReportGmailerrorred';
import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ErrorBlock = ({ blockName }: { blockName: string }) => {
  const { t } = useTranslation();
  return (
    <Grid container justifyContent={'center'} alignItems={'center'}>
      <ReportGmailerrorred fontSize="large" color="warning" />
      <Box marginLeft={3}>
        <Typography color="neutralMedium.main">
          {t('components.errorBlock.message', { blockName: blockName.toLocaleLowerCase() })}
        </Typography>
      </Box>
    </Grid>
  );
};

export default ErrorBlock;
