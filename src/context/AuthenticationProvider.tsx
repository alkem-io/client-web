import React, { FC } from 'react';
import { useAuthentication } from '../hooks';

export interface AuthContext {
  handleSignIn: () => void;
  handleSignOut: () => void;
}

const AuthenticationContext = React.createContext<AuthContext>({
  handleSignIn: () => null,
  handleSignOut: () => null,
});
const AuthenticationProvider: FC<{}> = ({ children }) => {
  const { handleSignIn, handleSignOut } = useAuthentication();

  return (
    <AuthenticationContext.Provider
      value={{
        handleSignIn,
        handleSignOut,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationProvider, AuthenticationContext };
