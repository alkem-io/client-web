import React, { FC } from 'react';
import { useQueryParams } from '../hooks/useQueryParams';
import { Restricted as RestrictedPage } from '../pages';

interface RestrictedParams {
  origin?: string;
}

export const Restricted: FC = () => {
  const params = useQueryParams();
  const origin = params.get('origin');
  return <RestrictedPage attemptedTarget={origin || ''} />;
};
