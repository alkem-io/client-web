import { FC, useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Loading from '@/core/ui/loading/Loading';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { useKratosClient } from '../hooks/useKratosClient';

type KratosError = {
  code: string;
  message: string;
  reason?: string;
};

export const ErrorRoute: FC = () => {
  const { t } = useTranslation();
  const params = useQueryParams();
  const errorCode = params.get('id');
  const [error, setError] = useState<KratosError | undefined>();
  const kratos = useKratosClient();

  useEffect(() => {
    if (errorCode && kratos) {
      kratos.getFlowError({ id: errorCode }).then(({ status, data, ..._response }) => {
        if (status !== 200) {
          console.error(data);
        }
        if (data && typeof data === 'object' && 'error' in data) {
          setError((data as { error: KratosError }).error);
        } else {
          setError(undefined);
        }
      });
    }
  }, [errorCode, kratos]);

  if (!error) {
    return <Loading text={t('kratos.loading-error')} />;
  }

  return (
    <Container maxWidth="sm">{error ? <p>{`${error.code} - ${error.message} (${error.reason})`}</p> : <></>}</Container>
  );
};

export default ErrorRoute;
