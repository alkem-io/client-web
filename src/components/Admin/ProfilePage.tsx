import React, { FC, useMemo } from 'react';
import ProfileForm from '../ProfileForm/ProfileForm';
import Button from '../core/Button';
import { EditMode } from './UserForm';
import { Path } from '../../context/NavigationProvider';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { useCreateChallengeMutation } from '../../generated/graphql';

interface Props {
  mode: EditMode;
  paths: Path[];
  title: string;
  profile?: any;
}

const MyComponent: FC<Props> = ({ paths, profile }) => {
  const currentPaths = useMemo(
    () => [...paths, { name: profile && profile.name ? profile.name : 'new', real: false }],
    [paths]
  );

  useUpdateNavigation({ currentPaths });

  const [createChallenge] = useCreateChallengeMutation({ onCompleted: () => console.log('done') });

  const onSubmit = values => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, textID, state, ...context } = values;
    createChallenge({
      variables: {
        challengeData: {
          name,
          textID,
          state: '',
          context,
        },
      },
    });
  };
  let submitWired;
  return (
    <>
      <ProfileForm context={{}} onSubmit={onSubmit} wireSubmit={submit => (submitWired = submit)} />
      <Button type={'submit'} variant="primary" onClick={() => submitWired()}>
        SAVE
      </Button>
    </>
  );
};

export default MyComponent;
