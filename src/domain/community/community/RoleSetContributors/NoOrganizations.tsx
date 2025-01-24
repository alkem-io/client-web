import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

const NoOrganizations = ({ type }: { type: 'leading' | 'member' }) => {
  const { t } = useTranslation();

  return (
    <Box component={Typography} display="flex" justifyContent="center">
      {t(`pages.community.${type}-organizations.no-data` as const)}
    </Box>
  );
};

export default NoOrganizations;
