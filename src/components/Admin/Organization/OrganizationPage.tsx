import { ApolloError } from '@apollo/client';
import React, { FC, useMemo, useState } from 'react';
import { Alert } from 'react-bootstrap';
import {
  Organisation,
  OrganisationInput,
  Reference,
  Tagset,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
} from '../../../generated/graphql';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { PageProps } from '../../../pages';
import { EditMode } from '../../../utils/editMode';
import OrganizationForm from './OrganizationForm';
interface Props extends PageProps {
  organization?: Organisation;
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

  const handleSubmit = (organisation: Organisation) => {
    const { id: orgID, profile, ...rest } = organisation;
    const organisationInput: OrganisationInput = {
      ...rest,
      profileData: {
        avatar: profile.avatar,
        description: profile.description || '',
        referencesData: [...(profile.references as Reference[])],
        tagsetsData: [...(profile.tagsets as Tagset[])].map(t => ({ name: t.name, tags: t.tags })),
      },
    };

    if (mode === EditMode.new) {
      createOrganization({
        variables: {
          organisationData: organisationInput,
        },
      });
    }
    if (mode === EditMode.edit) {
      updateOrganization({
        variables: {
          organisationData: organisationInput,
          orgID: Number(orgID),
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
