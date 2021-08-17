import { SelfServiceErrorContainer } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Container } from '@material-ui/core';
import { Loading } from '../../components/core/Loading/Loading';
import { useKratosClient } from '../../hooks';
import { useQueryParams } from '../../hooks';
import { logger } from '../../services/logging/winston/logger';

export const ErrorRoute: FC = () => {
  const params = useQueryParams();
  const errorCode = params.get('error');
  const [errorContainer, setErrorContainer] = useState<SelfServiceErrorContainer>();
  const kratos = useKratosClient();

  useEffect(() => {
    if (errorCode && kratos) {
      kratos.getSelfServiceError(errorCode).then(({ status, data: errorContainer, ..._response }) => {
        if (status !== 200) {
          logger.error(errorContainer);
        }
        setErrorContainer(errorContainer);
      });
    }
  }, [errorCode, kratos]);

  if (!errorContainer) {
    return <Loading text={'Loading config'} />;
  }

  return (
    <Container maxWidth="sm">
      {errorContainer.errors.map((e, i) => (
        <p key={i}>{`${e['code']} - ${e['message']} (${e['reason']})`}</p>
      ))}
    </Container>
  );
};

export default ErrorRoute;
