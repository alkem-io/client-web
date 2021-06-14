import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import Button from '../../../components/core/Button';
import Loading from '../../../components/core/Loading';
import Typography from '../../../components/core/Typography';
import ProfileForm, { ProfileFormValuesType } from '../../../components/ProfileForm/ProfileForm';
import {
  refetchEcoversesQuery,
  useCreateReferenceOnContextMutation,
  useDeleteReferenceMutation,
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

  const isLoading = loading1;
  const profile = ecoverse?.ecoverse;
  const profileTopLvlInfo = {
    name: profile?.displayName,
    nameID: profile?.nameID,
  };

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onSubmit = async (values: ProfileFormValuesType) => {
    const { name, nameID, ...context } = values;
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
        input: { context: contextWithUpdatedRefs, displayName: name, ID: ecoverseId },
      },
    });
  };

  let submitWired;
  return (
    <Container>
      <Typography variant={'h2'} className={'mt-4 mb-4'}>
        {'Edit Ecoverse'}
      </Typography>
      <ProfileForm
        isEdit={true}
        profile={profileTopLvlInfo || {}}
        context={profile?.context}
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
