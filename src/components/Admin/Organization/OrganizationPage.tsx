import { ApolloError } from '@apollo/client';
import React, { FC, useMemo, useState } from 'react';
import { Alert } from 'react-bootstrap';
import {
  CreateOrganisationInput,
  Organisation,
  Reference,
  Tagset,
  UpdateOrganisationInput,
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

  const handleSubmit = (organisation: Organisation) => {
    const { id: orgID, textID, profile, ...rest } = organisation;

    if (mode === EditMode.new) {
      const organisationInput: CreateOrganisationInput = {
        ...rest,
        textID,
        profileData: {
          avatar: profile.avatar,
          description: profile.description || '',
          referencesData: [...(profile.references as Reference[])],
          tagsetsData: [...(profile.tagsets as Tagset[])].map(t => ({ name: t.name, tags: t.tags })),
        },
      };

      createOrganization({
        variables: {
          input: organisationInput,
        },
      });
    }
    if (mode === EditMode.edit) {
      const organisationInput: UpdateOrganisationInput = {
        ID: orgID,
        ...rest,
        profileData: {
          ID: '-1', // TODO: Mustn't be provided.
          avatar: profile.avatar,
          description: profile.description || '',
        },
      };
      updateOrganization({
        variables: {
          input: {
            ...organisationInput,
          },
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
