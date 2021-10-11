import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../../components/core/Button';
import Section from '../../components/core/Section';
import Typography from '../../components/core/Typography';
import { useUpdateNavigation } from '../../hooks';

const paths = { currentPaths: [] };

export const Error404: FC = () => {
  useUpdateNavigation(paths);
  const { t } = useTranslation();
  return (
    <Section>
      <Typography as="h1" variant="h1">
        404
      </Typography>
      <Typography as="h5">{t('pages.four-ou-four.message')}</Typography>
      <div>
        <Button variant="primary" as={Link} to="/" text={t('buttons.home')} />
      </div>
    </Section>
  );
};
