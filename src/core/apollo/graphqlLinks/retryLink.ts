import { RetryLink } from '@apollo/client/link/retry';

// any is in Apollo types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const retryIf = (error: any) => {
  const doNotRetryCodes = [500, 400, 401, 403];
  return !!error && !doNotRetryCodes.includes(error.statusCode) && !error.response?.redirected;
};

export const retryLink = new RetryLink({
  delay: {
    initial: 1000,
    max: 5000,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf,
  },
});
