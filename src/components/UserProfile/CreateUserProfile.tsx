import React, { FC, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useCreateUserNewRegistrationMutation, useMeHasProfileQuery } from '../../generated/graphql';
import { useApolloErrorHandler } from '../../hooks/useApolloErrorHandler';
import { useAuthenticate } from '../../hooks/useAuthenticate';
import { useQueryParams } from '../../hooks/useQueryParams';
import { updateStatus } from '../../reducers/auth/actions';
import { Loading } from '../core/Loading';

interface CreateUserProfileProps {}

export const CreateUserProfile: FC<CreateUserProfileProps> = () => {
  const { resetStore } = useAuthenticate();
  const history = useHistory();
  const dispatch = useDispatch();
  const handleError = useApolloErrorHandler();
  const { data } = useMeHasProfileQuery();
  const params = useQueryParams();
  const goHome = useCallback(() => {
    const returnUrl = params.get('returnUrl');
    if (returnUrl) {
      history.push(returnUrl);
    } else {
      history.push('/');
    }
  }, [history, params]);

  const [createUser] = useCreateUserNewRegistrationMutation({
    onError: handleError,
    onCompleted: () => {
      resetStore().then(() => {
        dispatch(updateStatus('done'));
        goHome();
      });
    },
  });

  useEffect(() => {
    if (data) {
      if (data.meHasProfile) {
        goHome();
      } else {
        createUser();
      }
    }
  }, [data]);

  return <Loading text={'Initializing user profile ...'} />;
};
export default CreateUserProfile;
