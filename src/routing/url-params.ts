import nameof from '../utils/name-of';
import { AuthorizationCredential } from '../models/graphql-schema';

export default interface UrlParams extends Record<string, string | undefined> {
  ecoverseNameId?: string;
  challengeNameId?: string;
  opportunityNameId?: string;
  organizationNameId?: string;
  groupId?: string;
  projectNameId?: string;
  applicationId?: string;
  userId?: string;
  role?: AuthorizationCredential;
  discussionId?: string;
}

export const nameOfUrl = nameof<UrlParams>();
