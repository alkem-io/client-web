import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import WrapperButton from '../../common/components/core/WrapperButton';
import Section from '../../common/components/core/Section';
import WrapperTypography from '../../common/components/core/WrapperTypography';
import { useUpdateNavigation } from '../../hooks';

const paths = { currentPaths: [] };

export const Error404: FC = () => {
  useUpdateNavigation(paths);
  const { t } = useTranslation();
  return (
    <Section>
      <WrapperTypography as="h1" variant="h1">
        404
      </WrapperTypography>
      <WrapperTypography as="h5">{t('pages.four-ou-four.message')}</WrapperTypography>
      <div>
        <WrapperButton variant="primary" as={Link} to="/" text={t('buttons.home')} />
      </div>
    </Section>
  );
};
