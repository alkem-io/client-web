import Section from '@/core/ui/content/deprecated/Section';
import WrapperTypography from '@/core/ui/typography/deprecated/WrapperTypography';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const RestrictedPage = ({ attemptedTarget }: { attemptedTarget: string }) => {
  const { t } = useTranslation();

  return (
    <Section>
      <WrapperTypography as="h1" variant="h1" color="negative">
        Restricted
      </WrapperTypography>
      <WrapperTypography as="h5">
        To access <b>{attemptedTarget}</b> elevated privileges are required. Please contact your administrator for
        support.
      </WrapperTypography>
      <div>
        <Button variant="outlined" component={Link} to="/">
          {t('buttons.take-me-home')}
        </Button>
      </div>
    </Section>
  );
};
