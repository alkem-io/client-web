import React, { FC } from 'react';
import { useAuthentication } from '../hooks';
import { env } from '../env';

export interface AuthContext {
  handleSignIn: () => void;
  handleSignOut: () => void;
  authenticationEnabled: boolean;
}

const enableAuthentication = Boolean((env && env.REACT_APP_AUTHENTICATION_ENABLE) !== 'false');

const AuthenticationContext = React.createContext<AuthContext>({
  handleSignIn: () => null,
  handleSignOut: () => null,
  authenticationEnabled: false,
});
const AuthenticationProvider: FC<{}> = ({ children }) => {
  const { handleSignIn, handleSignOut } = useAuthentication(enableAuthentication);

  return (
    <AuthenticationContext.Provider
      value={{
        handleSignIn,
        handleSignOut,
        authenticationEnabled: enableAuthentication,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationProvider, AuthenticationContext };
