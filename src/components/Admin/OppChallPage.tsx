import React, { FC, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Path } from '../../context/NavigationProvider';
import {
  useChallengeProfileInfoLazyQuery,
  useCreateChallengeMutation,
  useCreateOpportunityMutation,
  useOpportunityProfileInfoLazyQuery,
  useUpdateChallengeMutation,
  useUpdateOpportunityMutation,
} from '../../generated/graphql';
import { QUERY_CHALLENGE_PROFILE_INFO, QUERY_OPPORTUNITY_PROFILE_INFO } from '../../graphql/admin';
import { NEW_CHALLENGE_FRAGMENT } from '../../graphql/challenge';
import { NEW_OPPORTUNITY_FRAGMENT } from '../../graphql/opportunity';
import { useEcoverse } from '../../hooks/useEcoverse';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import Button from '../core/Button';
import Loading from '../core/Loading';
import Typography from '../core/Typography';
import ProfileForm from '../ProfileForm/ProfileForm';

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
  const { challengeId = '', opportunityId = '', ecoverseId = '' } = useParams<Params>();
  const { toEcoverseId } = useEcoverse();
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<'success' | 'danger'>('success');
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
                fragment: NEW_CHALLENGE_FRAGMENT,
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
                fragment: NEW_OPPORTUNITY_FRAGMENT,
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
    refetchQueries: [{ query: QUERY_CHALLENGE_PROFILE_INFO, variables: { id: challengeId } }],
    awaitRefetchQueries: true,
  });
  const [updateOpportunity, { loading: loading4 }] = useUpdateOpportunityMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    onError: e => onError(e.message),
    refetchQueries: [{ query: QUERY_OPPORTUNITY_PROFILE_INFO, variables: { id: opportunityId } }],
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
    setVariant('success');
    setMessage(message);
  };

  const onError = (message: string) => {
    setVariant('danger');
    setMessage(message);
  };

  const currentPaths = useMemo(() => [...paths, { name: profile?.name || 'new', real: false }], [paths, profile]);
  useUpdateNavigation({ currentPaths });

  const onSubmit = values => {
    const { id, name, textID, state, ...context } = values;

    const updatedRefs = context.references.map(ref => ({ uri: ref.uri, name: ref.name })); // removing id from refs
    const contextWithUpdatedRefs = { ...context };
    contextWithUpdatedRefs.references = updatedRefs;

    const data = { name, textID, state: '', context: contextWithUpdatedRefs };
    const updateData = { name, state: '', context: contextWithUpdatedRefs };

    if (ProfileSubmitMode) {
      debugger;
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
    <>
      <Typography variant={'h3'} className={'mt-4 mb-4'}>
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
      <Alert show={!!message} variant={variant} onClose={() => setMessage(null)} dismissible>
        {message}
      </Alert>
    </>
  );
};

export default OppChallPage;
