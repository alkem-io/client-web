import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import WrapperButton from '../../ui/button/deprecated/WrapperButton';
import Section from '../../ui/content/deprecated/Section';
import WrapperTypography from '../../ui/typography/deprecated/WrapperTypography';
import { useUpdateNavigation } from '../../routing/useNavigation';
import { useTranslation } from 'react-i18next';

const paths = { currentPaths: [] };

export const RestrictedPage: FC<{ attemptedTarget: string }> = ({ attemptedTarget }) => {
  const { t } = useTranslation();
  useUpdateNavigation(paths);

  return (
    <Section>
      <WrapperTypography as="h1" variant="h1" color="negative">
        Restricted
      </WrapperTypography>
      <WrapperTypography as="h5">
        To access <b>{attemptedTarget}</b> elevated priviliges are required. Please contact your administrator for
        support.
      </WrapperTypography>
      <div>
        <WrapperButton inset as={Link} to="/" text={t('buttons.take-me-home')} />
      </div>
    </Section>
  );
};
