import { Box, Button, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { AUTH_LOGIN_PATH } from '../../../../core/auth/authentication/constants/authentication.constants';
import Section, { SectionSpacer } from '../Section/Section';

interface LoginSectionProps {
  infomationText: string;
  actionText: string;
}

const DashboardLoginSection: FC<LoginSectionProps> = ({ infomationText, actionText }) => {
  const { isAuthenticated } = useAuthenticationContext();

  return !isAuthenticated ? (
    <>
      <SectionSpacer />
      <Section>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body1">{infomationText}</Typography>
          <SectionSpacer />
          <Button variant="contained" LinkComponent={'a'} href={AUTH_LOGIN_PATH} sx={{ flexShrink: 0 }}>
            {actionText}
          </Button>
        </Box>
      </Section>
    </>
  ) : (
    <></>
  );
};

export default DashboardLoginSection;
