import ReportGmailerrorred from '@mui/icons-material/ReportGmailerrorred';
import { Box, GridLegacy, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ErrorBlock = ({ blockName }: { blockName: string }) => {
  const { t } = useTranslation();
  return (
    <GridLegacy container justifyContent={'center'} alignItems={'center'}>
      <ReportGmailerrorred fontSize="large" color="warning" />
      <Box marginLeft={3}>
        <Typography color="neutralMedium.main">
          {t('components.errorBlock.message', { blockName: blockName.toLocaleLowerCase() })}
        </Typography>
      </Box>
    </GridLegacy>
  );
};

export default ErrorBlock;
