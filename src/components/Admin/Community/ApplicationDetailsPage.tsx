import React, { FC } from 'react';
import { useParams } from 'react-router-dom';

interface Params {
  appId: string;
}

export const ApplicationDetailsPage: FC = () => {
  const { appId } = useParams<Params>();

  return (
    <>
      This is application #<b>{appId}</b>
    </>
  );
};
export default ApplicationDetailsPage;
