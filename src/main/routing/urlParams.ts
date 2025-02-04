import nameof from '@/core/utils/nameOf';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

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
  role?: RoleName;
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
