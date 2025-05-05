import { useMemo } from 'react';
import { useConfig } from '@/domain/platform/config/useConfig';
import { AuthenticationProviderConfigUnion, OryConfig } from '@/core/apollo/generated/graphql-schema';

export function isOryConfig(pet: AuthenticationProviderConfigUnion): pet is OryConfig {
  return (pet as OryConfig).__typename === 'OryConfig';
}

// const logFlowErrors = (response: AxiosResponse<{ ui: UiContainer } | {}>) => {
//   if ('ui' in response.data && response.data.ui.messages) {
//     for (const { text, type } of response.data.ui.messages) {
//       if (type !== 'error') {
//         continue;
//       }
//       const errorMessage = 'Kratos Flow Error: ' + text;
//       logError(new Error(errorMessage), { category: TagCategoryValues.AUTH });
//     }
//   }
// };

// const isWhoamiError401 = (error: AxiosError) => {
//   // Defensive: check config and response shape
//   const url = error.config && 'url' in error.config ? error.config.url : undefined;
//   const data = error.response?.data as { error?: { code?: number } } | undefined;
//   return url?.endsWith('/sessions/whoami') && data?.error?.code === 401;
// };

// const isAxiosError = (error: { isAxiosError: boolean }): error is AxiosError => error.isAxiosError;

// const getKratosErrorMessage = (requestError: AxiosError) => {
//   const errMessage = requestError.message;

//   if (errMessage) {
//     return `Kratos Error: ${errMessage}`;
//   }

//   if (requestError.response?.data) {
//     // Use a safer type for data
//     const data = requestError.response.data as { message?: string; reason?: string; error?: { message?: string } };
//     const message = data.message;
//     const reason = data.reason;
//     const errorObj = data.error;
//     const errorMessage = message ? [message, reason].filter(v => v).join(' ') : errorObj?.message;
//     return `Kratos Error: ${errorMessage}`;
//   } else {
//     return `Kratos ${requestError}`;
//   }
// };

// const createAxiosClient = () => {
//   const client = axios.create({
//     withCredentials: true,
//   });
//   client.interceptors.response.use(
//     value => {
//       try {
//         logFlowErrors(value);
//       } catch (e) {}
//       return value;
//     },
//     error => {
//       if (isAxiosError(error) && !isWhoamiError401(error)) {
//         const errorMessage = getKratosErrorMessage(error);
//         logError(new Error(errorMessage), { category: TagCategoryValues.AUTH });
//       }
//       throw error;
//     }
//   );
//   return client;
// };

export const useKratosClient = () => {
  const { authentication } = useConfig();

  // const axiosClient = useRef(once(createAxiosClient)).current();

  return useMemo(() => {
    if (!authentication) {
      return undefined;
    }
    const config = authentication?.providers.map(x => x.config).find(x => isOryConfig(x));
    // OryClient expects a config object
    return {
      basePath: config?.kratosPublicBaseURL,
      withCredentials: true,
    };
  }, [authentication /*, axiosClient*/]);
};
