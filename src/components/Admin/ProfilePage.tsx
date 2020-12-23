import React, { FC, useMemo } from 'react';
import ProfileForm from '../ProfileForm/ProfileForm';
import Button from '../core/Button';
import { EditMode } from './UserForm';
import { Path } from '../../context/NavigationProvider';
import { useUpdateNavigation } from '../../hooks/useNavigation';

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

  const onSubmit = values => console.log(values);
  let submitWired;
  return (
    <div>
      Profile
      <ProfileForm context={{}} onSubmit={onSubmit} wireSubmit={submit => (submitWired = submit)} />
      <Button type={'submit'} variant="primary" onClick={() => submitWired()}>
        SAVE
      </Button>
    </div>
  );
};

export default MyComponent;
