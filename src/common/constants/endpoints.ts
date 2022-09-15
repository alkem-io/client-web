import { env } from '../../types/env';

const domain = (env && env.REACT_APP_ALKEMIO_DOMAIN) ?? '';
export const publicGraphQLEndpoint = domain + '/api/public/graphql';
export const privateGraphQLEndpoint = domain + '/api/private/graphql';
