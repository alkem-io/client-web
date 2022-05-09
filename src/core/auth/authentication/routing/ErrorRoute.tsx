import { SelfServiceError } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Loading } from '../../../../common/components/core';
import { useQueryParams } from '../../../../hooks';
import { logger } from '../../../../services/logging/winston/logger';
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
          logger.error(selfServiceError);
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
