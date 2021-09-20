import nameof from '../utils/name-of';
import { AuthorizationCredential } from '../models/graphql-schema';

export default interface UrlParams {
  ecoverseId: string;
  challengeId: string;
  opportunityId: string;
  organizationId: string;
  groupId: string;
  projectId: string;
  applicationId: string;
  userId: string;
  role: AuthorizationCredential;
}

export const nameOfUrl = nameof<UrlParams>();
