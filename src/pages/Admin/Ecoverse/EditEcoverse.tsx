import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import EcoverseEditForm, { EcoverseEditFormValuesType } from '../../../components/Admin/EcoverseEditForm';
import Button from '../../../components/core/Button';
import Loading from '../../../components/core/Loading';
import Typography from '../../../components/core/Typography';
import {
  refetchEcoversesQuery,
  useCreateReferenceOnContextMutation,
  useDeleteReferenceMutation,
  useOrganizationsListQuery,
  useUpdateEcoverseMutation,
} from '../../../generated/graphql';
import { useApolloErrorHandler } from '../../../hooks/useApolloErrorHandler';
import { useEcoverse } from '../../../hooks/useEcoverse';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { useNotification } from '../../../hooks/useNotification';
import { UpdateContextInput, UpdateReferenceInput } from '../../../types/graphql-schema';
import { PageProps } from '../../common';

interface EcoverseEditProps extends PageProps {}

export const EditEcoverse: FC<EcoverseEditProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'edit', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const { ecoverseId, ecoverse } = useEcoverse();
  const { data: organizationList, loading: loadingOrganizations } = useOrganizationsListQuery();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
  const [addReference] = useCreateReferenceOnContextMutation();
  const [deleteReference] = useDeleteReferenceMutation();

  const [updateEcoverse, { loading: loading1 }] = useUpdateEcoverseMutation({
    refetchQueries: [refetchEcoversesQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => onSuccess('Successfully created'),
    onError: handleError,
  });

  const organizations = useMemo(
    () => organizationList?.organisations.map(e => ({ id: e.id, name: e.displayName })) || [],
    [organizationList]
  );

  const isLoading = loading1 || loadingOrganizations;
  const profile = ecoverse?.ecoverse;
  const profileTopLvlInfo = {
    name: profile?.displayName,
    nameID: profile?.nameID,
    hostID: profile?.host?.id,
  };

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onSubmit = async (values: EcoverseEditFormValuesType) => {
    const { name, nameID, host, ...context } = values;
    const contextId = profile?.context?.id || '';

    const initialReferences = profile?.context?.references || [];
    // TODO [ATS] Extract outside. Already used at leat twice.
    const toUpdate = context.references.filter(x => x.id);
    const toRemove = initialReferences.filter(x => x.id && !context.references.some(r => r.id && r.id === x.id));
    const toAdd = context.references.filter(x => !x.id);
    for (const ref of toRemove) {
      await deleteReference({ variables: { input: { ID: ref.id } } });
    }
    for (const ref of toAdd) {
      await addReference({
        variables: {
          input: {
            contextID: contextId,
            name: ref.name,
            description: ref.description,
            uri: ref.uri,
          },
        },
      });
    }

    const updatedRefs = toUpdate.map<UpdateReferenceInput>(r => ({
      ID: r.id,
      description: r.description,
      name: r.name,
      uri: r.uri,
    }));

    const contextWithUpdatedRefs: UpdateContextInput = { ...context, references: updatedRefs };

    updateEcoverse({
      variables: {
        input: { context: contextWithUpdatedRefs, displayName: name, ID: ecoverseId, hostID: host },
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
        profile={profileTopLvlInfo || {}}
        context={profile?.context}
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
