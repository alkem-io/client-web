import React from 'react';
import { Box, Typography as MUITypography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EmailVerificationNotice = () => {
  const { t } = useTranslation();

  return (
    <>
      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center">
        <ErrorOutlineIcon
          color="primary"
          sx={theme => ({
            fontSize: '3rem',
            marginRight: theme.spacing(3),
          })}
        />
        <MUITypography variant="h3" sx={{ fontWeight: 'normal' }}>
          {t('pages.verification-required.message')}
        </MUITypography>
      </Box>
      <Box
        component={Link}
        to="/identity/verify"
        sx={{
          fontSize: '1.5rem',
          color: 'text.primary',
        }}
      >
        {t('pages.verification-required.link')}
      </Box>
    </>
  );
};

export default EmailVerificationNotice;
