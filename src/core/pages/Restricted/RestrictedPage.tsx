import Section from '@/core/ui/content/deprecated/Section';
import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const RestrictedPage = ({ attemptedTarget }: { attemptedTarget: string }) => {
  const { t } = useTranslation();

  return (
    <Section>
      <Typography variant="h1" color="negative.main" fontWeight="medium" my={1}>
        Restricted
      </Typography>
      <Typography variant="h5" fontWeight="normal" my={1}>
        To access <b>{attemptedTarget}</b> elevated privileges are required. Please contact your administrator for
        support.
      </Typography>
      <div>
        <Button variant="outlined" component={Link} to="/">
          {t('buttons.take-me-home')}
        </Button>
      </div>
    </Section>
  );
};
