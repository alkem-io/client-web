import Section from '@/core/ui/content/deprecated/Section';
import { privateGraphQLEndpoint } from '@/main/constants/endpoints';
import { Button, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

export const ErrorPage = ({ error }: { error: Error }) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
      <Section>
        <Typography variant="h1" mb={3}>
          {t('pages.error.title')}
        </Typography>
        <Typography variant="h3" mb={2} fontWeight="medium" color="neutral.main">
          <Trans
            i18nKey="pages.error.line1"
            values={{ message: error.message }}
            components={{
              italic: <i />,
            }}
          />
        </Typography>
        <Typography variant="h3" mb={2} fontWeight="medium" color="neutral.main">
          {t('pages.error.line2', { graphQLEndpoint: privateGraphQLEndpoint })}
        </Typography>
        {import.meta.env.MODE === 'development' && <Typography mb={2}>{error.stack}</Typography>}
        <Typography variant="h5" color="neutralMedium.main" fontWeight="regular" mb={2}>
          {t('pages.error.line3')}
        </Typography>
        <div>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            {t('pages.error.buttons.reload')}
          </Button>
        </div>
      </Section>
    </div>
  );
};
