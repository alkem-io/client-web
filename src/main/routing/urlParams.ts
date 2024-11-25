import nameof from '@/core/utils/nameOf';
import { AuthorizationCredential } from '@/core/apollo/generated/graphql-schema';

export default interface UrlParams extends Record<string, string | undefined> {
  spaceNameId?: string;
  subspaceNameId?: string;
  subsubspaceNameId?: string;
  organizationNameId?: string;
  groupId?: string;
  projectNameId?: string;
  applicationId?: string;
  userNameId?: string;
  vcNameId?: string;
  role?: AuthorizationCredential;
  discussionNameId?: string;
  calloutNameId?: string;
  postNameId?: string;
  whiteboardNameId?: string;
  templateNameId?: string;
  calendarEventNameId?: string;
  innovationPackNameId?: string;
  innovationHubNameId?: string;
}

export const nameOfUrl = nameof<UrlParams>();
