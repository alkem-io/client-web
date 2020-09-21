import { AuthenticationResult } from '@azure/msal-browser';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateToken } from '../reducers/auth/actions';
import { getProfile } from '../actions/serviceActions';

interface ProfileContainerProps {
  acquireToken: () => Promise<void | AuthenticationResult | undefined>;
}

const ProfileContainer: React.FC<ProfileContainerProps> = props => {
  const dispatch = useDispatch();
  const { acquireToken } = props;

  useEffect(() => {
    acquireToken().then(response => {
      if (response) {
        // set access token
        dispatch(updateToken(response));

        if (response.idTokenClaims) {
          const idToken = response.idTokenClaims as Record<string, any>;
          // Our mock database assign user Ids based on MS Graph API account id, which corresponds to the "oid" claim in the id_token
          // visit https://docs.microsoft.com/en-us/azure/active-directory/develop/id-tokens for more information
          const tokenOID = idToken.oid.replace(/-/gi, ''); // removing dashes

          // check if user already exists
          try {
            dispatch(getProfile(tokenOID));
          } catch (err) {
            console.log(err);
          }
        }
      }
    });
  });

  return (
    <div>
      {(() => {
        // let component = null;
        //   switch (renderComponent) {
        //     case 1:
        //       component = <ProfileRegister {...this.props} />;
        //       break;
        //     case 2:
        //       component = <ProfileEdit {...this.props} />;
        //       break;
        //     case 3:
        //       component = <ProfileView {...this.props} />;
        //       break;
        //     default:
        return <div>No Content</div>;
        // }
      })()}
    </div>
  );
};

export default ProfileContainer;
