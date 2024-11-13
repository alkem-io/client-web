import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { privateGraphQLEndpoint } from '@main/constants/endpoints';
import WrapperButton from '../../ui/button/deprecated/WrapperButton';
import Section from '../../ui/content/deprecated/Section';
import WrapperTypography from '../../ui/typography/deprecated/WrapperTypography';

export const ErrorPage: FC<{ error: Error }> = ({ error }) => {
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
          <WrapperButton
            variant="primary"
            text={t('pages.error.buttons.reload')}
            onClick={() => window.location.reload()}
          />
        </div>
      </Section>
    </div>
  );
};
