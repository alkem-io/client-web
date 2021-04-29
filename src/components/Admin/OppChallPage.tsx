import React, { FC, useEffect, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Path } from '../../context/NavigationProvider';
import {
  ChallengeProfileInfoDocument,
  NewChallengeFragmentDoc,
  NewOpportunityFragmentDoc,
  OpportunityProfileInfoDocument,
  useChallengeProfileInfoLazyQuery,
  useCreateChallengeMutation,
  useCreateOpportunityMutation,
  useCreateReferenceOnContextMutation,
  useDeleteReferenceMutation,
  useOpportunityProfileInfoLazyQuery,
  useUpdateChallengeMutation,
  useUpdateOpportunityMutation,
} from '../../generated/graphql';
import { useEcoverse } from '../../hooks/useEcoverse';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { useNotification } from '../../hooks/useNotification';
import { UpdateContextInput, UpdateReferenceInput } from '../../types/graphql-schema';
import Button from '../core/Button';
import Loading from '../core/Loading';
import Typography from '../core/Typography';
import ProfileForm, { ProfileFormValuesType } from '../ProfileForm/ProfileForm';

export enum ProfileSubmitMode {
  createChallenge,
  updateChallenge,
  createOpportunity,
  updateOpportunity,
}

interface Props {
  mode: ProfileSubmitMode;
  paths: Path[];
  title: string;
}
interface Params {
  challengeId?: string;
  opportunityId?: string;
  ecoverseId?: string;
}

const OppChallPage: FC<Props> = ({ paths, mode, title }) => {
  const notify = useNotification();
  const [addReference] = useCreateReferenceOnContextMutation();
  const [deleteReference] = useDeleteReferenceMutation();
  const { challengeId = '', opportunityId = '', ecoverseId = '' } = useParams<Params>();
  const { toEcoverseId } = useEcoverse();
  const [getChallengeProfileInfo, { data: challengeProfile }] = useChallengeProfileInfoLazyQuery();
  const [getOpportunityProfileInfo, { data: opportunityProfile }] = useOpportunityProfileInfoLazyQuery();
  const [createChallenge, { loading: loading1 }] = useCreateChallengeMutation({
    update: (cache, { data }) => {
      if (data) {
        const { createChallenge } = data;

        cache.modify({
          fields: {
            challenges(exitingChallenges = []) {
              const newChallenge = cache.writeFragment({
                data: createChallenge,
                fragment: NewChallengeFragmentDoc,
              });
              return [...exitingChallenges, newChallenge];
            },
          },
        });
      }
    },
    onCompleted: () => onSuccess('Successfully created'),
    onError: e => onError(e.message),
  });
  const [createOpportunity, { loading: loading2 }] = useCreateOpportunityMutation({
    update: (cache, { data }) => {
      if (data) {
        const { createOpportunity } = data;

        cache.modify({
          fields: {
            opportunities(existingOpportunities = []) {
              const newOpportunities = cache.writeFragment({
                data: createOpportunity,
                fragment: NewOpportunityFragmentDoc,
              });
              return [...existingOpportunities, newOpportunities];
            },
          },
        });
      }
    },
    onCompleted: () => onSuccess('Successfully created'),
    onError: e => onError(e.message),
  });
  const [updateChallenge, { loading: loading3 }] = useUpdateChallengeMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    onError: e => onError(e.message),
    refetchQueries: [{ query: ChallengeProfileInfoDocument, variables: { id: challengeId } }],
    awaitRefetchQueries: true,
  });
  const [updateOpportunity, { loading: loading4 }] = useUpdateOpportunityMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    onError: e => onError(e.message),
    refetchQueries: [{ query: OpportunityProfileInfoDocument, variables: { id: opportunityId } }],
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    if (mode === ProfileSubmitMode.updateChallenge) getChallengeProfileInfo({ variables: { id: challengeId } });
    if (mode === ProfileSubmitMode.updateOpportunity) getOpportunityProfileInfo({ variables: { id: opportunityId } });
  }, []);

  const isEdit = mode === ProfileSubmitMode.updateOpportunity || mode === ProfileSubmitMode.updateChallenge;

  const isLoading = loading1 || loading2 || loading3 || loading4;
  const profile = challengeProfile?.ecoverse?.challenge || opportunityProfile?.ecoverse?.opportunity;
  const profileTopLvlInfo = {
    name: profile?.name,
    textID: profile?.textID,
  };

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onError = (message: string) => {
    notify(message, 'error');
  };

  const currentPaths = useMemo(() => [...paths, { name: profile?.name || 'new', real: false }], [paths, profile]);
  useUpdateNavigation({ currentPaths });

  const onSubmit = async (values: ProfileFormValuesType) => {
    const { name, textID, ...context } = values;
    const contextId = profile?.context?.id || '';

    const initialReferences = profile?.context?.references || [];
    const toUpdate = context.references.filter(x => x.id);

    if (mode === ProfileSubmitMode.updateChallenge || mode === ProfileSubmitMode.updateOpportunity) {
      const toRemove = initialReferences.filter(x => x.id && !context.references.some(r => r.id && r.id === x.id));
      const toAdd = context.references.filter(x => !x.id);
      for (const ref of toRemove) {
        await deleteReference({ variables: { input: { ID: Number(ref.id) } } });
      }
      for (const ref of toAdd) {
        await addReference({
          variables: {
            input: {
              parentID: Number(contextId),
              name: ref.name,
              description: ref.description,
              uri: ref.uri,
            },
          },
        });
      }
    }
    const updatedRefs: UpdateReferenceInput[] = toUpdate.map<UpdateReferenceInput>(r => ({
      ID: Number(r.id),
      description: r.description,
      name: r.name,
      uri: r.uri,
    }));

    const contextWithUpdatedRefs: UpdateContextInput = { ...context, references: updatedRefs };

    const data = { name, textID, context };
    const updateData = { name, context: contextWithUpdatedRefs };

    if (ProfileSubmitMode) {
      switch (mode) {
        case ProfileSubmitMode.createChallenge:
          createChallenge({
            variables: {
              input: {
                ...data,
                parentID: Number(toEcoverseId(ecoverseId)), // TODO [ATS] Where is this coming from?
              },
            },
          });
          break;
        case ProfileSubmitMode.updateChallenge:
          updateChallenge({
            variables: {
              input: { ...updateData, ID: challengeId },
            },
          });
          break;
        case ProfileSubmitMode.createOpportunity:
          createOpportunity({
            variables: {
              input: {
                ...data,
                parentID: challengeId,
              },
            },
          });
          break;
        case ProfileSubmitMode.updateOpportunity:
          updateOpportunity({
            variables: {
              opportunityData: {
                ...updateData,
                ID: opportunityId,
              },
            },
          });
          break;
        default:
          throw new Error('Submit handler not found');
      }
    }
  };

  let submitWired;
  return (
    <Container>
      <Typography variant={'h2'} className={'mt-4 mb-4'}>
        {title}
      </Typography>
      <ProfileForm
        isEdit={isEdit}
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

export default OppChallPage;
