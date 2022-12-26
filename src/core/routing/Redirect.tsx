import React from 'react';
import { Navigate, NavigateProps, useParams } from 'react-router-dom';

interface RedirectProps extends NavigateProps {
  to: string;
}

const Redirect = ({ to, ...props }: RedirectProps) => {
  const match = useParams();

  return <Navigate to={`../${to}/${match['*']}`} replace {...props} />;
};

export default Redirect;
