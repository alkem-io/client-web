import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthenticationContext } from '../hooks';

export const NotAuthenticatedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthenticationContext();

  if (isAuthenticated) return <Navigate to={'/'} />;

  return (
    // Show the component only when the user is logged in
    // Otherwise, redirect the user to /signin page
    <>{children}</>
  );
};
