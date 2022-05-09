import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../../common/components/core/Button';
import Section from '../../common/components/core/Section';
import Typography from '../../common/components/core/Typography';
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
