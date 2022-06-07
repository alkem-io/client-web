import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ContributorType } from './types';

interface NoOrganizationsProps {
  type: ContributorType;
}

const NoOrganizations = ({ type }: NoOrganizationsProps) => {
  const { t } = useTranslation();

  return (
    <Box component={Typography} display="flex" justifyContent="center">
      {t(`pages.community.${type}-organizations.no-data` as const)}
    </Box>
  );
};

export default NoOrganizations;
