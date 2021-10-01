import React, { FC } from 'react';
import { ApplicationDialog } from '../../composite';
import { useApplicationByEcoverseQuery } from '../../../hooks/generated/graphql';

interface Props {
  show: boolean;
  onHide: () => void;
  ecoverseId: string;
  applicationId: string;
}

const ApplicationDialogWrapper: FC<Props> = ({ show, onHide, ecoverseId, applicationId }) => {
  const { data, loading } = useApplicationByEcoverseQuery({
    variables: { ecoverseId: ecoverseId, appId: applicationId },
    skip: !show,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });
  const application = data?.ecoverse.application;

  return <>{show && <ApplicationDialog app={application} onHide={onHide} loading={loading} />}</>;
};
export default ApplicationDialogWrapper;
