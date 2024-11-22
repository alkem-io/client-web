import React, { FC } from 'react';
import { useUrlParams } from '@/core/routing/useUrlParams';

export const ApplicationDetailsPage: FC = () => {
  const { applicationId } = useUrlParams();

  return (
    <>
      This is application #<b>{applicationId}</b>
    </>
  );
};

export default ApplicationDetailsPage;
