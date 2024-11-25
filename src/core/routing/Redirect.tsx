import { Navigate, NavigateProps, useParams } from 'react-router-dom';

interface RedirectProps extends NavigateProps {
  to: string;
}

/**
 * Redirects to a different root path while keeping all path segments that * has matched.
 * E.g. under a route /registration/* <Redirect to="/login"> takes from /registration/success to /login/success
 * @param to
 * @param props
 * @constructor
 */
const Redirect = ({ to, ...props }: RedirectProps) => {
  const match = useParams();

  return <Navigate to={`../${to}/${match['*']}`} replace {...props} />;
};

export default Redirect;
