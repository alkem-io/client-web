import { useTranslation } from 'react-i18next';
import ReportGmailerrorred from '@mui/icons-material/ReportGmailerrorred';
import WrapperTypography from '../typography/deprecated/WrapperTypography';
import { Box, Grid } from '@mui/material';

const ErrorBlock = ({ blockName }: { blockName: string }) => {
  const { t } = useTranslation();
  return (
    <Grid container justifyContent={'center'} alignItems={'center'}>
      <ReportGmailerrorred fontSize="large" color="warning" />
      <Box marginLeft={3}>
        <WrapperTypography variant={'h5'} color={'neutralMedium'}>
          {t('components.errorBlock.message', { blockName: blockName.toLocaleLowerCase() })}
        </WrapperTypography>
      </Box>
    </Grid>
  );
};

export default ErrorBlock;
