import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Button from '../components/core/Button';
import Section from '../components/core/Section';
import Typography from '../components/core/Typography';
import { env } from '../types/env';

const graphQLEndpoint = (env && env.REACT_APP_GRAPHQL_ENDPOINT) || '/graphql';

export const Error: FC<{ error: Error }> = ({ error }) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
      <Section>
        <Typography as="h1" variant="h1" weight="bold">
          {t('pages.error.title')}
        </Typography>
        <Typography as="h2" variant="h3" color="neutral">
          <Trans
            i18nKey="pages.error.line1"
            values={{ message: error.message }}
            components={{
              italic: <i />,
            }}
          />
        </Typography>
        <Typography as="h2" variant="h3" color="neutral">
          {t('pages.error.line2', { graphQLEndpoint })}
        </Typography>
        <Typography as="h5" variant="h5" color="neutralMedium">
          {t('pages.error.line3')}
        </Typography>
        <div>
          <Button variant="primary" text={t('pages.error.buttons.reload')} onClick={() => window.location.reload()} />
        </div>
      </Section>
    </div>
  );
};
