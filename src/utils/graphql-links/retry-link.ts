import { RetryLink } from '@apollo/client/link/retry';

const retryIf = (error: any) => {
  const doNotRetryCodes = [500, 400];
  return !!error && !doNotRetryCodes.includes(error.statusCode) && !error.response.redirected;
};

export const retryLink = new RetryLink({
  delay: {
    initial: 1000,
    max: 5000,
    jitter: true,
  },
  attempts: {
    max: 25,
    retryIf,
  },
});
