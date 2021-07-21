import { SelfServiceError } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Loading } from '../../components/core/Loading';
import { useKratosClient } from '../../hooks/useKratosClient';
import { useQueryParams } from '../../hooks/useQueryParams';

export const ErrorRoute: FC = () => {
  const params = useQueryParams();
  const errorCode = params.get('error');
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
    return <Loading text={'Loading config'} />;
  }

  return (
    <Container fluid={'sm'}>
      {error.error ? <p>{`${error.error['code']} - ${error.error['message']} (${error.error['reason']})`}</p> : null}
    </Container>
  );
};

export default ErrorRoute;
