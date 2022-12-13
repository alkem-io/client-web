import { Button } from '@mui/material';
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
import { PageTitle } from '../../../ui/typography';
import SubHeading from '../../../../domain/shared/components/Text/SubHeading';
import { Link } from 'react-router-dom';

interface RegisterPageProps {
  flow: string;
}

export const RecoveryPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { flow: recoveryFlow, loading, error } = useKratosFlow(FlowTypeName.Recovery, flow);

  if (loading) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (error) {
    return <ErrorDisplay />;
  }

  return (
    <KratosForm ui={recoveryFlow?.ui}>
      <Container marginTop={9} maxWidth={sxCols(7)} gap={4}>
        <FixedHeightLogo />
        <PageTitle>{t('pages.recovery.header')}</PageTitle>
        <SubHeading textAlign="center">{t('pages.recovery.message')}</SubHeading>
        <KratosUI ui={recoveryFlow?.ui} />
        <Button component={Link} to={'/'} variant="outlined">
          {t('pages.verification-required.return-to-platform')}
        </Button>
      </Container>
    </KratosForm>
  );
};
export default RecoveryPage;
