import Section from '@/core/ui/content/deprecated/Section';
import WrapperTypography from '@/core/ui/typography/deprecated/WrapperTypography';
import { privateGraphQLEndpoint } from '@/main/constants/endpoints';
import { Button } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

export const ErrorPage = ({ error }: { error: Error }) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
      <Section>
        <WrapperTypography as="h1" variant="h1" weight="bold">
          {t('pages.error.title')}
        </WrapperTypography>
        <WrapperTypography as="h2" variant="h3" color="neutral">
          <Trans
            i18nKey="pages.error.line1"
            values={{ message: error.message }}
            components={{
              italic: <i />,
            }}
          />
        </WrapperTypography>
        <WrapperTypography as="h2" variant="h3" color="neutral">
          {t('pages.error.line2', { graphQLEndpoint: privateGraphQLEndpoint })}
        </WrapperTypography>
        {import.meta.env.MODE === 'development' && <WrapperTypography as="pre">{error.stack}</WrapperTypography>}
        <WrapperTypography as="h5" variant="h5" color="neutralMedium">
          {t('pages.error.line3')}
        </WrapperTypography>
        <div>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            {t('pages.error.buttons.reload')}
          </Button>
        </div>
      </Section>
    </div>
  );
};
