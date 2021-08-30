import { SelfServiceError } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Container } from '@material-ui/core';
import { Loading } from '../../components/core/Loading/Loading';
import { useKratosClient } from '../../hooks';
import { useQueryParams } from '../../hooks';
import { logger } from '../../services/logging/winston/logger';

export const ErrorRoute: FC = () => {
  const params = useQueryParams();
  const errorCode = params.get('id');
  const [error, setError] = useState<SelfServiceError>();
  const kratos = useKratosClient();

  useEffect(() => {
    if (errorCode && kratos) {
      kratos.getSelfServiceError(errorCode).then(({ status, data: selfServiceError, ..._response }) => {
        if (status !== 200) {
          logger.error(selfServiceError);
        }
        setError(selfServiceError);
      });
    }
  }, [errorCode, kratos]);

  if (!error) {
    return <Loading text={'Loading config'} />;
  }

  return (
    <Container maxWidth="sm">
      {error.error ? <p>{`${error.error['code']} - ${error.error['message']} (${error.error['reason']})`}</p> : <></>}
    </Container>
  );
};

export default ErrorRoute;
