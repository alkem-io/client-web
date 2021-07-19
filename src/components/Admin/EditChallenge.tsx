import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import Typography from '../core/Typography';
import ProfileForm, { ProfileFormValuesType } from '../ProfileForm/ProfileForm';
import Button from '../core/Button';
import Loading from '../core/Loading';
import { Path } from '../../context/NavigationProvider';
import { useNotification } from '../../hooks/useNotification';
import { useApolloErrorHandler } from '../../hooks/useApolloErrorHandler';
import { useParams } from 'react-router';
import {
  refetchChallengeProfileInfoQuery,
  refetchChallengesWithCommunityQuery,
  useChallengeProfileInfoQuery,
  useCreateChallengeMutation,
  useUpdateChallengeMutation,
} from '../../generated/graphql';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { CreateContextInput, UpdateContextInput, UpdateReferenceInput } from '../../types/graphql-schema';
import { FormMode } from '../../navigation/admin/challenge';

interface Params {
  challengeId?: string;
  ecoverseId?: string;
}

interface Props {
  mode: FormMode;
  paths: Path[];
  title: string;
}

const EditChallenge: FC<Props> = ({ paths, mode, title }) => {
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
  const onSuccess = (message: string) => notify(message, 'success');

  const { challengeId: challengeNameId = '', ecoverseId = '' } = useParams<Params>();

  const [createChallenge, { loading: isCreating }] = useCreateChallengeMutation({
    onCompleted: () => onSuccess('Successfully created'),
    onError: handleError,
    refetchQueries: [refetchChallengesWithCommunityQuery({ ecoverseId })],
    awaitRefetchQueries: true,
  });

  const [updateChallenge, { loading: isUpdating }] = useUpdateChallengeMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    onError: handleError,
    refetchQueries: [refetchChallengeProfileInfoQuery({ ecoverseId, challengeId: challengeNameId })],
    awaitRefetchQueries: true,
  });

  const { data: challengeProfile } = useChallengeProfileInfoQuery({
    variables: { ecoverseId: ecoverseId, challengeId: challengeNameId },
    skip: mode === FormMode.create,
  });
  const challenge = challengeProfile?.ecoverse?.challenge;
  const challengeId = useMemo(() => challenge?.id || '', [challenge]);

  const isLoading = isCreating || isUpdating;

  const currentPaths = useMemo(() => [...paths, { name: challenge?.displayName || 'new', real: false }], [
    paths,
    challenge,
  ]);
  useUpdateNavigation({ currentPaths });

  const onSubmit = async (values: ProfileFormValuesType) => {
    const { name, nameID, background, impact, tagline, vision, who, references, visual, tagsets } = values;

    const updatedRefs: UpdateReferenceInput[] = references.map<UpdateReferenceInput>(r => ({
      ID: r.id,
      description: r.description,
      name: r.name,
      uri: r.uri,
    }));

    const updateContext: UpdateContextInput = {
      background: background,
      impact: impact,
      references: updatedRefs,
      tagline: tagline,
      vision: vision,
      visual: visual,
      who: who,
    };
    const createContext: CreateContextInput = {
      background: background,
      impact: impact,
      references: references,
      tagline: tagline,
      vision: vision,
      visual: visual,
      who: who,
    };

    switch (mode) {
      case FormMode.create:
        createChallenge({
          variables: {
            input: {
              nameID: nameID,
              displayName: name,
              parentID: ecoverseId,
              context: createContext,
              tags: tagsets.map(x => x.tags.join()),
            },
          },
        });
        break;
      case FormMode.update:
        updateChallenge({
          variables: {
            input: {
              ID: challengeId,
              nameID: nameID,
              displayName: name,
              context: updateContext,
              tags: tagsets.map(x => x.tags.join()),
            },
          },
        });
        break;
      default:
        throw new Error(`Submit mode expected: (${mode}) found`);
    }
  };

  let submitWired;
  return (
    <Container>
      <Typography variant={'h2'} className={'mt-4 mb-4'}>
        {title}
      </Typography>
      <ProfileForm
        isEdit={mode === FormMode.update}
        name={challenge?.displayName}
        nameID={challenge?.nameID}
        tagset={challenge?.tagset}
        context={challenge?.context}
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
export default EditChallenge;
