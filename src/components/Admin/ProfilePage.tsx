import React, { FC, useEffect, useMemo } from 'react';
import ProfileForm from '../ProfileForm/ProfileForm';
import Button from '../core/Button';
import { Path } from '../../context/NavigationProvider';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import {
  useChallengeProfileInfoLazyQuery,
  useCreateChallengeMutation,
  useUpdateChallengeMutation,
} from '../../generated/graphql';
import { useParams } from 'react-router-dom';
import { QUERY_CHALLENGE_PROFILE_INFO } from '../../graphql/admin';
import Typography from '../core/Typography';

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

const ProfilePage: FC<Props> = ({ paths, mode, title }) => {
  const { challengeId, opportunityId } = useParams<Params>();
  const [getChallengeProfileInfo, { data: challengeProfile }] = useChallengeProfileInfoLazyQuery();
  const [createChallenge] = useCreateChallengeMutation();
  const [updateChallenge] = useUpdateChallengeMutation({
    refetchQueries: [{ query: QUERY_CHALLENGE_PROFILE_INFO, variables: { id: Number(challengeId) } }],
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    if (challengeId && !opportunityId) getChallengeProfileInfo({ variables: { id: Number(challengeId) } });
  }, []);

  const profile = challengeProfile?.challenge;
  const profileTopLvlInfo = {
    name: profile?.name,
    textID: profile?.textID,
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
            challengeData: data,
            challengeID: Number(challengeId),
          },
        });
        break;
      case ProfileSubmitMode.createOpportunity:
        // createOpportunity
        break;
      case ProfileSubmitMode.updateOpportunity:
        // updateOpportunity
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
        profile={profileTopLvlInfo || {}}
        context={profile?.context || {}}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <div className={'d-flex mt-4'}>
        <Button className={'ml-auto'} variant="primary" onClick={() => submitWired()}>
          SAVE
        </Button>
      </div>
    </>
  );
};

export default ProfilePage;
