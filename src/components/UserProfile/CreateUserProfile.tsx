import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { v4 } from 'uuid';
import { useCreateUserMutation } from '../../generated/graphql';
import { useApolloErrorHandler } from '../../hooks/useApolloErrorHandler';
import { useAuthenticate } from '../../hooks/useAuthenticate';
import { useNotification } from '../../hooks/useNotification';
import { useWhoami } from '../../hooks/useWhoami';
import { WELCOME_PAGE } from '../../models/Constants';
import { defaultUser, UserModel } from '../../models/User';
import { updateStatus } from '../../reducers/auth/actions';
import { CreateUserInput } from '../../types/graphql-schema';
import { EditMode } from '../../utils/editMode';
import { Loading } from '../core/Loading';
import { UserForm } from './UserForm';

interface CreateUserProfileProps {}

export const CreateUserProfile: FC<CreateUserProfileProps> = () => {
  const { resetStore } = useAuthenticate();
  const { session: iam } = useWhoami();
  const dispatch = useDispatch();
  const history = useHistory();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
  const [createUser, { loading }] = useCreateUserMutation({
    onError: handleError,
    onCompleted: () => {
      notify('User profile created successfully', 'success');
      resetStore().then(() => {
        dispatch(updateStatus('done'));
        history.push(WELCOME_PAGE);
      });
    },
  });

  const handleSave = async (user: UserModel) => {
    const { id: userID, memberof, profile, ...rest } = user;

    const userInput: CreateUserInput = {
      ...rest,
      nameID: `${rest.firstName}-${rest.lastName}-${v4()} `.slice(0, 25),
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
    <UserForm
      title={'To continue please create a profile!'}
      user={{
        ...defaultUser,
        firstName: iam?.identity?.traits?.name?.first || '',
        lastName: iam?.identity?.traits?.name?.last || '',
        displayName: `${iam?.identity?.traits?.name?.first || ''} ${iam?.identity?.traits?.name?.last || ''}`,
        email: iam?.identity?.traits?.email || '',
      }}
      editMode={EditMode.edit}
      onSave={handleSave}
    />
  );
};
export default CreateUserProfile;
