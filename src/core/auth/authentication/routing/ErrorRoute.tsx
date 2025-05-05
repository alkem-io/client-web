import { FC, useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Loading from '@/core/ui/loading/Loading';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { useKratosClient } from '../hooks/useKratosClient';

interface KratosError {
  error?: {
    code?: number;
    message?: string;
    reason?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const ErrorRoute: FC = () => {
  const { t } = useTranslation();
  const params = useQueryParams();
  const errorCode = params.get('id');
  const [error, setError] = useState<KratosError>();
  const kratos = useKratosClient();

  useEffect(() => {
    if (errorCode && kratos) {
      axios
        .get(`${kratos.basePath}/self-service/errors?id=${errorCode}`, { withCredentials: true })
        .then(({ status, data: selfServiceError }) => {
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
