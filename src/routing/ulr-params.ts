import nameof from '../utils/name-of';
import { AuthorizationCredential } from '../models/graphql-schema';

export default interface UrlParams {
  ecoverseNameId: string;
  challengeNameId: string;
  opportunityNameId: string;
  organizationNameId: string;
  groupId: string;
  projectId: string;
  applicationId: string;
  userId: string;
  role: AuthorizationCredential;
}

export const nameOfUrl = nameof<UrlParams>();
