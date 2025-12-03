import { Error403 } from './Error403';
import { Error404 } from './Error404';
import { ErrorPage } from './ErrorPage';

interface Error40XProps {
  isNotFound?: boolean;
  isNotAuthorized?: boolean;
  error?: Error;
}
export const Error40X = ({ isNotFound, isNotAuthorized, error }: Error40XProps) => {
  if (isNotAuthorized) {
    return <Error403 />;
  } else if (isNotFound) {
    return <Error404 />;
  } else if (error) {
    return <ErrorPage error={error} />;
  } else {
    throw new Error('Unhandled error');
  }
};
