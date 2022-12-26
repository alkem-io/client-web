import { Navigate, NavigateProps, useParams } from 'react-router-dom';
import React from 'react';

interface RedirectProps extends NavigateProps {
  to: string;
}

const Redirect = ({ to }: RedirectProps) => {
  const match = useParams();

  return <Navigate to={`../${to}/${match['*']}`} replace />;
};

export default Redirect;
