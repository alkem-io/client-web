import { AuthenticationResult } from '@azure/msal-browser';
import React, { ReactNode } from 'react';

interface ProfileContainerProps {
  acquireToken: () => Promise<void | AuthenticationResult | undefined>;
  children?: ReactNode;
}

const ProfileContainer: React.FunctionComponent<ProfileContainerProps> = props => {
  // const dispatch = useDispatch();
  const { children } = props;

  // useEffect(() => {
  //   acquireToken().then(response => {
  //     if (response) {
  //       // set access token
  //       dispatch(updateToken(response));
  //     }
  //   });
  // }, []);

  return <div className="profile-container">{children};</div>;
};

export default ProfileContainer;
