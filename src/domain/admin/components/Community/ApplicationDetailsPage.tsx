import React, { FC } from 'react';
import { useUrlParams } from '../../../../hooks';

export const ApplicationDetailsPage: FC = () => {
  const { applicationId } = useUrlParams();

  return (
    <>
      This is application #<b>{applicationId}</b>
    </>
  );
};
export default ApplicationDetailsPage;
