import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import Container from '../../../../domain/shared/layout/Container';
import FixedHeightLogo from '../components/FixedHeightLogo';
import SubHeading from '../../../../domain/shared/components/Text/SubHeading';
import Paragraph from '../../../../domain/shared/components/Text/Paragraph';
import { sxCols } from '../../../../domain/shared/layout/Grid';
import { PageTitle } from '../../../ui/typography';

interface VerificationSuccessPageProps {}

export const VerificationSuccessPage: FC<VerificationSuccessPageProps> = () => {
  const { t } = useTranslation();

  return (
    <Container marginTop={9} maxWidth={sxCols(7)} gap={4}>
      <FixedHeightLogo />
      <PageTitle>{t('pages.verification-success.header')}</PageTitle>
      <SubHeading textAlign="center">{t('pages.verification-success.subheader')}</SubHeading>
      <Paragraph textAlign="center">{t('pages.verification-success.message')}</Paragraph>
      <Button component={Link} to={'/'} variant="contained">
        {t('pages.verification-required.return-to-platform')}
      </Button>
    </Container>
  );
};
export default VerificationSuccessPage;
