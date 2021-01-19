import React, { FC, useEffect, useMemo, useState } from 'react';
import ProfileForm from '../ProfileForm/ProfileForm';
import Button from '../core/Button';
import { Path } from '../../context/NavigationProvider';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import {
  useChallengeProfileInfoLazyQuery,
  useCreateChallengeMutation,
  useCreateOpportunityMutation,
  useOpportunityProfileInfoLazyQuery,
  useUpdateChallengeMutation,
  useUpdateOpportunityMutation,
} from '../../generated/graphql';
import { useParams } from 'react-router-dom';
import { QUERY_CHALLENGE_PROFILE_INFO, QUERY_OPPORTUNITY_PROFILE_INFO } from '../../graphql/admin';
import Typography from '../core/Typography';
import { Alert } from 'react-bootstrap';
import Loading from '../core/Loading';
import { NEW_OPPORTUNITY_FRAGMENT } from '../../graphql/opportunity';
import { NEW_CHALLENGE_FRAGMENT } from '../../graphql/challenge';

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
}

const OppChallPage: FC<Props> = ({ paths, mode, title }) => {
  const { challengeId, opportunityId } = useParams<Params>();
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<'success' | 'error'>('success');
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
        const { createOpportunityOnChallenge } = data;

        cache.modify({
          fields: {
            opportunities(existingOpportunities = []) {
              debugger;
              const newOpportunities = cache.writeFragment({
                data: createOpportunityOnChallenge,
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
    refetchQueries: [{ query: QUERY_CHALLENGE_PROFILE_INFO, variables: { id: Number(challengeId) } }],
    awaitRefetchQueries: true,
  });
  const [updateOpportunity, { loading: loading4 }] = useUpdateOpportunityMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    onError: e => onError(e.message),
    refetchQueries: [{ query: QUERY_OPPORTUNITY_PROFILE_INFO, variables: { id: Number(opportunityId) } }],
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    if (mode === ProfileSubmitMode.updateChallenge) getChallengeProfileInfo({ variables: { id: Number(challengeId) } });
    if (mode === ProfileSubmitMode.updateOpportunity)
      getOpportunityProfileInfo({ variables: { id: Number(opportunityId) } });
  }, []);

  const isEdit = mode === ProfileSubmitMode.updateOpportunity || mode === ProfileSubmitMode.updateChallenge;

  const isLoading = loading1 || loading2 || loading3 || loading4;
  const profile = challengeProfile?.challenge || opportunityProfile?.opportunity;
  const profileTopLvlInfo = {
    name: profile?.name,
    textID: profile?.textID,
  };

  const onSuccess = (message: string) => {
    setVariant('success');
    setMessage(message);
  };

  const onError = (message: string) => {
    setVariant('error');
    setMessage(message);
  };

  const currentPaths = useMemo(() => [...paths, { name: profile?.name || 'new', real: false }], [paths, profile]);
  useUpdateNavigation({ currentPaths });

  const onSubmit = values => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, name, textID, state, ...context } = values;

    const updatedRefs = context.references.map(ref => ({ uri: ref.uri, name: ref.name })); // removing id from refs
    const contextWithUpdatedRefs = { ...context };
    contextWithUpdatedRefs.references = updatedRefs;

    const data = { name, textID, state: '', context: contextWithUpdatedRefs };
    const updateData = { name, state: '', context: contextWithUpdatedRefs };

    if (ProfileSubmitMode)
      switch (mode) {
        case ProfileSubmitMode.createChallenge:
          createChallenge({
            variables: {
              challengeData: data,
            },
          });
          break;
        case ProfileSubmitMode.updateChallenge:
          updateChallenge({
            variables: {
              challengeData: { ID: Number(challengeId), ...updateData },
            },
          });
          break;
        case ProfileSubmitMode.createOpportunity:
          createOpportunity({
            variables: {
              opportunityData: data,
              challengeID: Number(challengeId),
            },
          });
          break;
        case ProfileSubmitMode.updateOpportunity:
          updateOpportunity({
            variables: {
              opportunityData: data,
              ID: Number(opportunityId),
            },
          });
          break;
        default:
          throw new Error('Submit handler not found');
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
        context={profile?.context || {}}
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
