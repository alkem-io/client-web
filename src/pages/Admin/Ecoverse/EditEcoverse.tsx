import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import EcoverseEditForm, { EcoverseEditFormValuesType } from '../../../components/Admin/EcoverseEditForm';
import Button from '../../../components/core/Button';
import Loading from '../../../components/core/Loading/Loading';
import Typography from '../../../components/core/Typography';
import { useOrganizationsListQuery, useUpdateEcoverseMutation } from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { useEcoverse } from '../../../hooks';
import { useUpdateNavigation } from '../../../hooks';
import { useNotification } from '../../../hooks';
import { PageProps } from '../../common';
import { updateContextInput } from '../../../utils/buildContext';

interface EcoverseEditProps extends PageProps {}

export const EditEcoverse: FC<EcoverseEditProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'edit', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const { ecoverseId, ecoverse } = useEcoverse();
  const { data: organizationList, loading: loadingOrganizations } = useOrganizationsListQuery();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();

  const [updateEcoverse, { loading: loading1 }] = useUpdateEcoverseMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    onError: handleError,
  });

  const organizations = useMemo(
    () => organizationList?.organisations.map(e => ({ id: e.id, name: e.displayName })) || [],
    [organizationList]
  );

  const isLoading = loading1 || loadingOrganizations;
  const profile = ecoverse?.ecoverse;

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onSubmit = async (values: EcoverseEditFormValuesType) => {
    const { name, host, tagsets, anonymousReadAccess } = values;

    updateEcoverse({
      variables: {
        input: {
          context: updateContextInput(values),
          displayName: name,
          ID: ecoverseId,
          hostID: host,
          tags: tagsets.map(x => x.tags.join()),
          authorizationPolicy: {
            anonymousReadAccess: anonymousReadAccess,
          },
        },
      },
    });
  };

  let submitWired;
  return (
    <Container>
      <Typography variant={'h2'} className={'mt-4 mb-4'}>
        {'Edit Ecoverse'}
      </Typography>
      <EcoverseEditForm
        isEdit={true}
        name={profile?.displayName}
        nameID={profile?.nameID}
        hostID={profile?.host?.id}
        tagset={profile?.tagset}
        context={profile?.context}
        anonymousReadAccess={profile?.authorization?.anonymousReadAccess}
        organizations={organizations}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <div className={'d-flex mt-4 mb-4'}>
        <Button disabled={isLoading} className={'ml-auto'} variant="primary" onClick={() => submitWired()}>
          {isLoading ? <Loading text={'Processing'} /> : 'Save'}
        </Button>
      </div>
    </Container>
  );
};
export default EditEcoverse;
