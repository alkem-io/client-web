import { SelfServiceErrorContainer } from '@ory/kratos-client';
import { FC, useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Loading from '@/core/ui/loading/Loading';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { useKratosClient } from '../hooks/useKratosClient';

export const ErrorRoute: FC = () => {
  const { t } = useTranslation();
  const params = useQueryParams();
  const errorCode = params.get('id');
  const [error, setError] = useState<SelfServiceErrorContainer>();
  const kratos = useKratosClient();

  useEffect(() => {
    if (errorCode && kratos) {
      kratos.getSelfServiceError(errorCode).then(({ status, data: selfServiceError, ..._response }) => {
        if (status !== 200) {
          console.error(selfServiceError);
        }
        setError(selfServiceError);
      });
    }
  }, [errorCode, kratos]);

  if (!error) {
    return <Loading text={t('kratos.loading-error')} />;
  }

  return (
    <Container maxWidth="sm">
      {error.error ? <p>{`${error.error['code']} - ${error.error['message']} (${error.error['reason']})`}</p> : <></>}
    </Container>
  );
};

export default ErrorRoute;
