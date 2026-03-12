import { privateGraphQLEndpoint } from '@/main/constants/endpoints';
import { Button, Container, Link, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generateSupportMailtoUrl } from '@/core/ui/notifications/generateSupportMailtoUrl';
import { error as sentryError, TagCategoryValues } from '@/core/logging/sentry/log';

type ErrorPageProps = {
  error: Error;
  numericCode?: number;
};

export const ErrorPage = ({ error, numericCode }: ErrorPageProps) => {
  const { t } = useTranslation();
  const mailtoUrl = generateSupportMailtoUrl({ numericCode, t });

  // Safety net: ensure every ErrorPage render is tracked in Sentry.
  // Sentry deduplicates if the same error was already captured upstream (e.g. SentryErrorBoundary).
  useEffect(() => {
    sentryError(error, { category: TagCategoryValues.UI, label: 'ErrorPage' });
  }, [error]);

  return (
    <Container maxWidth="lg">
      <Typography variant="h1" mb={3} mt={4}>
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
      {numericCode !== undefined && (
        <Typography variant="h4" mb={2} fontWeight="medium" color="neutral.main">
          {t('apollo.errors.support.emailSubject', { code: numericCode })}
        </Typography>
      )}
      <Typography variant="h3" mb={2} fontWeight="medium" color="neutral.main">
        {t('pages.error.line2', { graphQLEndpoint: privateGraphQLEndpoint })}
      </Typography>
      {import.meta.env.MODE === 'development' && <Typography mb={2}>{error.stack}</Typography>}
      <Typography variant="h5" color="neutralMedium.main" fontWeight="regular" mb={2}>
        <Trans
          i18nKey="pages.error.line3"
          components={{
            contact: <Link href={mailtoUrl} />,
          }}
        />
      </Typography>
      <div>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          {t('pages.error.buttons.reload')}
        </Button>
      </div>
    </Container>
  );
};
