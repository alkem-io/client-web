import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router';
import { Container } from 'react-bootstrap';
import { Path } from '../../context/NavigationProvider';
import Typography from '../core/Typography';
import ProfileForm, { ProfileFormValuesType } from '../ProfileForm/ProfileForm';
import Button from '../core/Button';
import { useNotification } from '../../hooks';
import { useApolloErrorHandler } from '../../hooks';
import { useUpdateNavigation } from '../../hooks';
import {
  refetchChallengeProfileInfoQuery,
  refetchChallengesWithCommunityQuery,
  useChallengeProfileInfoQuery,
  useCreateChallengeMutation,
  useUpdateChallengeMutation,
} from '../../hooks/generated/graphql';
import FormMode from './FormMode';
import { createContextInput, updateContextInput } from '../../utils/buildContext';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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

  const currentPaths = useMemo(
    () => [...paths, { name: challengeId ? 'edit' : 'new', real: false }],
    [paths, challenge]
  );
  useUpdateNavigation({ currentPaths });

  const onSubmit = async (values: ProfileFormValuesType) => {
    const { name, nameID, tagsets } = values;

    switch (mode) {
      case FormMode.create:
        createChallenge({
          variables: {
            input: {
              nameID: nameID,
              displayName: name,
              parentID: ecoverseId,
              context: createContextInput(values),
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
              context: updateContextInput(values),
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
        <Button
          disabled={isLoading}
          className={'ml-auto'}
          variant="primary"
          onClick={() => submitWired()}
          text={t(`buttons.${isLoading ? 'processing' : 'save'}`)}
        />
      </div>
    </Container>
  );
};
export default EditChallenge;
