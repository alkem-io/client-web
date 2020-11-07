import React, { FC } from 'react';
import { useAuthentication } from '../hooks';

export interface AuthContext {
  handleSignIn: () => void;
  handleSignOut: () => void;
  loading: boolean;
}

const AuthenticationContext = React.createContext<AuthContext>({
  handleSignIn: () => null,
  handleSignOut: () => null,
  loading: true,
});
const AuthenticationProvider: FC<{}> = ({ children }) => {
  const { handleSignIn, handleSignOut, loading } = useAuthentication();

  return (
    <AuthenticationContext.Provider
      value={{
        handleSignIn,
        handleSignOut,
        loading,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationProvider, AuthenticationContext };
