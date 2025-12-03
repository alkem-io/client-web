import { Error404 } from './Error404';
import { ErrorPage } from './ErrorPage';

interface Error40XProps {
  isNotFound?: boolean;
  isNotAuthorized?: boolean;
  error?: Error;
}
export const Error40X = ({ isNotFound, isNotAuthorized, error }: Error40XProps) => {
  if (isNotAuthorized) {
    return <div>403 - Not Authorized</div>;
  } else if (isNotFound) {
    return <Error404 />;
  } else if (error) {
    return <ErrorPage error={error} />;
  } else {
    return <div>40X Error</div>;
  }
};
