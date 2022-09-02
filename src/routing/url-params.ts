import nameof from '../common/utils/name-of';
import { AuthorizationCredential } from '../models/graphql-schema';

export default interface UrlParams extends Record<string, string | undefined> {
  hubNameId?: string;
  challengeNameId?: string;
  opportunityNameId?: string;
  organizationNameId?: string;
  groupId?: string;
  projectNameId?: string;
  applicationId?: string;
  userNameId?: string;
  role?: AuthorizationCredential;
  discussionId?: string;
  calloutNameId?: string;
  aspectNameId?: string;
  canvasNameId?: string;
}

export const nameOfUrl = nameof<UrlParams>();
