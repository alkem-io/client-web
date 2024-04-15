import { SelfServiceError } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Loading from '../../../ui/loading/Loading';
import { useQueryParams } from '../../../routing/useQueryParams';
import { useKratosClient } from '../hooks/useKratosClient';

export const ErrorRoute: FC = () => {
  const { t } = useTranslation();
  const params = useQueryParams();
  const errorCode = params.get('id');
  const [error, setError] = useState<SelfServiceError>();
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
