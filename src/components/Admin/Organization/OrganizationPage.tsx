import React, { FC, useMemo, useState } from 'react';
import { PageProps } from '../../../pages';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { Alert } from 'react-bootstrap';
import OrganizationForm from './OrganizationForm';
import { Organisation, useCreateOrganizationMutation, useUpdateOrganizationMutation } from '../../../generated/graphql';
import { ApolloError } from '@apollo/client';
import { EditMode } from '../../../utils/editMode';

interface Props extends PageProps {
  organization?: any;
  title?: string;
  mode: EditMode;
}

const OrganizationPage: FC<Props> = ({ organization, title, mode, paths }) => {
  const [status, setStatus] = useState<'success' | 'error' | undefined>();
  const [message, setMessage] = useState<string | undefined>(undefined);
  const currentPaths = useMemo(() => [...paths, { name: organization?.name ? 'edit' : 'new', real: false }], [paths]);

  useUpdateNavigation({ currentPaths });

  const handleError = (error: ApolloError) => {
    setStatus('error');
    setMessage(error.message);
  };

  const [createOrganization] = useCreateOrganizationMutation({
    onCompleted: () => {
      setMessage('Organization created successfully');
      setStatus('success');
    },
    onError: error => handleError(error),
    awaitRefetchQueries: true,
    refetchQueries: ['organizationsList'],
  });

  const [updateOrganization] = useUpdateOrganizationMutation({
    onError: error => handleError(error),
    onCompleted: () => {
      setMessage('Organization updated successfully');
      setStatus('success');
    },
  });

  // TODO: need remove org method when its ready on backend

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmit = ({ name, profile }: Organisation) => {
    if (mode === EditMode.new) {
      createOrganization({
        variables: {
          organisationData: {
            name,
          },
        },
      });
    }
    if (mode === EditMode.edit) {
      // TODO: Add profile to the update method when backend accepts it

      updateOrganization({
        variables: {
          organisationData: {
            name,
          },
          orgID: Number(organization?.id),
        },
      });
    }
  };

  return (
    <>
      <Alert
        show={status !== undefined}
        variant={status === 'error' ? 'danger' : status}
        onClose={() => setStatus(undefined)}
        dismissible
      >
        {message}
      </Alert>
      <OrganizationForm organization={organization} onSave={handleSubmit} editMode={mode} title={title} />
    </>
  );
};

export default OrganizationPage;
