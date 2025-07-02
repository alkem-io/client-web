interface UrlParams extends Record<string, string | undefined> {
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

/***
 * Unsupported in IE
 * https://stackoverflow.com/a/63891494/11207901
 */
const nameOf = <T>() => {
  return new Proxy(
    {},
    {
      get: function (_target, prop) {
        return prop;
      },
    }
  ) as {
    [P in keyof T]: P;
  };
};

/**
 * Do not remove even if ts-prune says it is unused.
 */
export const nameOfUrl = nameOf<UrlParams>();
