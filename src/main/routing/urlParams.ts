import nameof from '@/core/utils/nameOf';

export default interface UrlParams extends Record<string, string | undefined> {
  spaceNameId?: string;
  subspaceNameId?: string;
  subsubspaceNameId?: string;
  organizationNameId?: string;
  applicationId?: string;
  userNameId?: string;
  vcNameId?: string;
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
