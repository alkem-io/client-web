import nameof from '../../common/utils/name-of';
import { AuthorizationCredential } from '../apollo/generated/graphql-schema';

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
  whiteboardNameId?: string;
  innovationTemplateId?: string;
  calendarEventNameId?: string;
  innovationPackNameId?: string;
}

export const nameOfUrl = nameof<UrlParams>();
