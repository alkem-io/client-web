import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import KratosUI from '../components/KratosUI';
import Loading from '../../../../common/components/core/Loading/Loading';
import useKratosFlow, { FlowTypeName } from '../../../../core/auth/authentication/hooks/useKratosFlow';
import { ErrorDisplay } from '../../../../domain/shared/components/ErrorDisplay';
import KratosForm from '../components/Kratos/KratosForm';
import Container from '../../../../domain/shared/layout/Container';
import { sxCols } from '../../../../domain/shared/layout/Grid';
import FixedHeightLogo from '../components/FixedHeightLogo';
import SubHeading from '../../../../domain/shared/components/Text/SubHeading';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { PageTitle } from '../../../ui/typography';

interface RegisterPageProps {
  flow?: string;
}

export const VerificationPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { flow: verificationFlow, loading, error } = useKratosFlow(FlowTypeName.Verification, flow);

  if (loading) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (error) {
    return <ErrorDisplay />;
  }

  return (
    <KratosForm ui={verificationFlow?.ui}>
      <Container marginTop={9} maxWidth={sxCols(7)} gap={4}>
        <FixedHeightLogo />
        <PageTitle>{t('pages.verification.header')}</PageTitle>
        <SubHeading textAlign="center">{t('pages.verification.message')}</SubHeading>
        <KratosUI ui={verificationFlow?.ui} />
        <Button component={Link} to={'/'} variant="outlined">
          {t('pages.verification-required.return-to-platform')}
        </Button>
      </Container>
    </KratosForm>
  );
};
export default VerificationPage;
