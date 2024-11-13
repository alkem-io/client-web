import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Link, styled, Typography } from '@mui/material';
import { RouterLink } from '@core/ui/link/deprecated/RouterLink';
import { useConfig } from '../../../platform/config/useConfig';
import { ROUTE_HOME } from '../../../platform/routes/constants';

const FullscreenBox = styled(Box)(() => ({
  display: 'flex',
  flexGrow: 1,
  justifyContent: 'center',
  alignItems: 'center',
}));
const CenterBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}));
const ButtonBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  marginTop: theme.spacing(1),
}));

interface ErrorDisplayProps {}

export const ErrorDisplay: FC<ErrorDisplayProps> = () => {
  const { t } = useTranslation();
  const { locations } = useConfig();
  const supportLink = locations?.support;
  const handleReload = useCallback(() => window.location.reload(), []);

  return (
    <FullscreenBox>
      <CenterBox>
        <Box>
          <Typography variant="h1">{t('components.error-display.title')}</Typography>
          <Typography variant="h4">{t('components.error-display.went-wrong')}</Typography>
          <Typography variant="h4">{t('components.error-display.contact-support-sentence')}</Typography>
          <ButtonBox>
            <Button component={RouterLink} to={ROUTE_HOME}>
              {t('components.error-display.buttons.take-me-home')}
            </Button>
            <Button onClick={handleReload}>{t('components.error-display.buttons.reload')}</Button>
            <Link component={Button} href={supportLink} target="_blank">
              {t('components.error-display.buttons.contact-support')}
            </Link>
          </ButtonBox>
        </Box>
      </CenterBox>
    </FullscreenBox>
  );
};
