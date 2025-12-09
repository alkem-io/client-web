import { useConfig } from '@/domain/platform/config/useConfig';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { Box, Button, Link, Typography, styled } from '@mui/material';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

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

export const ErrorDisplay: FC = () => {
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
              {t('buttons.takeMeHome')}
            </Button>
            <Button onClick={handleReload}>{t('components.error-display.buttons.reload')}</Button>
            <Link href={supportLink} target="_blank">
              {t('components.error-display.buttons.contact-support')}
            </Link>
          </ButtonBox>
        </Box>
      </CenterBox>
    </FullscreenBox>
  );
};
