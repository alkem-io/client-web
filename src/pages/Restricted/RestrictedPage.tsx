import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../common/components/core/Button';
import Section from '../../common/components/core/Section';
import Typography from '../../common/components/core/Typography';
import { useUpdateNavigation } from '../../hooks';
import { useTranslation } from 'react-i18next';

const paths = { currentPaths: [] };

export const RestrictedPage: FC<{ attemptedTarget: string }> = ({ attemptedTarget }) => {
  const { t } = useTranslation();
  useUpdateNavigation(paths);

  return (
    <Section>
      <Typography as="h1" variant="h1" color="negative">
        Restricted
      </Typography>
      <Typography as="h5">
        To access <b>{attemptedTarget}</b> elevated priviliges are required. Please contact your administrator for
        support.
      </Typography>
      <div>
        <Button inset as={Link} to="/" text={t('buttons.take-me-home')} />
      </div>
    </Section>
  );
};
