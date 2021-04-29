import React, { FC } from 'react';
import { Container } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { useCreateUserMutation } from '../../generated/graphql';
import { useAuthenticate } from '../../hooks/useAuthenticate';
import { useNotification } from '../../hooks/useNotification';
import { AUTH_USER_KEY, WELCOME_PAGE } from '../../models/Constants';
import { defaultUser, UserModel } from '../../models/User';
import { CreateUserInput } from '../../types/graphql-schema';
import { EditMode } from '../../utils/editMode';
import { UserForm } from '../Admin/User/UserForm';
import { Loading } from '../core/Loading';

interface CreateUserProfileProps {}

export const CreateUserProfile: FC<CreateUserProfileProps> = () => {
  const { resetStore } = useAuthenticate();
  const history = useHistory();
  const notify = useNotification();
  const [createUser, { loading }] = useCreateUserMutation({
    onError: error => console.log(error),
    onCompleted: () => {
      notify('User profile created successfully', 'success');
      resetStore().then(() => {
        history.push(WELCOME_PAGE);
      });
    },
  });

  const handleSave = async (user: UserModel) => {
    const { id: userID, memberof, profile, ...rest } = user;

    const userInput: CreateUserInput = {
      ...rest,
      profileData: {
        avatar: profile.avatar,
        description: profile.description,
        referencesData: [...profile.references].map(t => ({ name: t.name, uri: t.uri })),
        tagsetsData: [...profile.tagsets],
      },
    };

    await createUser({
      variables: {
        input: userInput,
      },
    });
  };

  if (loading) return <Loading text={'Saving User Profile ...'} />;
  return (
    <Container className={'mt-5'}>
      <UserForm
        title={'To continue please create a profile!'}
        user={{ ...defaultUser, email: localStorage.getItem(AUTH_USER_KEY) || '' }}
        editMode={EditMode.edit}
        onSave={handleSave}
      />
    </Container>
  );
};
export default CreateUserProfile;
