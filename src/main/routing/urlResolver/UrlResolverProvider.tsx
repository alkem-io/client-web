import { useUrlResolverQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceLevel, UrlType } from '@/core/apollo/generated/graphql-schema';
import { compact } from 'lodash';
import { createContext, ReactNode, useEffect, useRef, useState } from 'react';

export type JourneyPath = [] | [string] | [string, string] | [string, string, string];

export type UrlResolverContextValue = {
  type: UrlType | undefined;
  // Space:
  /**
   * The current Space or Subspace Id, no matter the level
   */
  spaceId: string | undefined;
  spaceLevel: SpaceLevel | undefined;
  levelZeroSpaceId: string | undefined;
  /**
   * [level0, level1, level2]
   */
  journeyPath: JourneyPath | undefined;
  /**
   * The parent space id of the current space
   */
  parentSpaceId: string | undefined;

  // Collaboration:
  collaborationId: string | undefined;
  calloutsSetId: string | undefined;
  calloutId: string | undefined;
  contributionId: string | undefined;
  postId: string | undefined;
  whiteboardId: string | undefined;

  // Contributors:
  organizationId: string | undefined;
  userId: string | undefined;
  vcId: string | undefined;

  // Forum:
  discussionId: string | undefined;

  // Templates
  innovationPackId: string | undefined;
  templatesSetId: string | undefined;
  templateId: string | undefined;

  //!! pending
  innovationHubId: string | undefined;
  loading: boolean;
};

const emptyResult: UrlResolverContextValue = {
  type: undefined,
  spaceId: undefined,
  spaceLevel: undefined,
  levelZeroSpaceId: undefined,
  journeyPath: [],
  parentSpaceId: undefined,
  collaborationId: undefined,
  calloutsSetId: undefined,
  calloutId: undefined,
  contributionId: undefined,
  postId: undefined,
  whiteboardId: undefined,
  organizationId: undefined,
  userId: undefined,
  vcId: undefined,
  discussionId: undefined,
  innovationPackId: undefined,
  templatesSetId: undefined,
  templateId: undefined,
  innovationHubId: undefined,
  loading: true,
};

const UrlResolverContext = createContext<UrlResolverContextValue>(emptyResult);

const UrlResolverProvider = ({ children }: { children: ReactNode }) => {
  /**
   * Apollo's cache is too smart
   * for example:
   *   - for a Url like /space/spaceNameId/settings/templates
   *      the server is returning { spaceId: 1234, templateId: null } // which is correct
   *   - but then when the user navigates to /space/spaceNameId/settings/templates/templateNameId
   *      the server is returning { spaceId: 1234, templateId: 5678 } // which is also correct
   *   - but then when the user closes the dialog, and the URL changes back to /space/spaceNameId/settings/templates
   *      Apollo is not making the request again, which is good,
   *      but the cache is returning the previous value { spaceId: 1234, templateId: 5678 },
   *      completing that null templateId which is wrong
   *
   * So I had to write a dumber cache that just stores url => result object
   */
  const cache = useRef<Record<string, UrlResolverContextValue>>({});
  const value = useRef<UrlResolverContextValue>(emptyResult);
  // Using a state to force a re-render of the children when the url changes
  const [currentUrl, setCurrentUrl] = useState(window.location.href);

  // Force a re-render also when the url changes through the history API
  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentUrl(window.location.href);
    };
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      window.dispatchEvent(new Event('pushstate'));
      return result;
    };

    window.history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event('replacestate'));
      return result;
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('pushstate', handleUrlChange);
    window.addEventListener('replacestate', handleUrlChange);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('pushstate', handleUrlChange);
      window.removeEventListener('replacestate', handleUrlChange);
    };
  }, []);

  const { data: urlResolverData, loading: urlResolverLoading } = useUrlResolverQuery({
    variables: {
      url: currentUrl,
    },
    skip: cache.current[currentUrl] !== undefined,
  });

  if (cache.current[currentUrl]) {
    value.current = cache.current[currentUrl];
  } else {
    //!! memoize this with lodash? window.location.href
    //const result = useMemo<UrlResolverContextValue>(() => {
    if (urlResolverData?.urlResolver.type) {
      const result = (() => {
        const type = urlResolverData?.urlResolver.type;
        const data = urlResolverData?.urlResolver;
        const spaceId = data?.space?.id;
        const spacesIds = compact([...(data?.space?.parentSpaces ?? []), spaceId]);
        const journeyPath = spacesIds.length > 0 ? (spacesIds as JourneyPath) : undefined;

        return {
          type,
          // Space:
          spaceId: data?.space?.id,
          spaceLevel: data?.space?.level,
          levelZeroSpaceId: data?.space?.levelZeroSpaceID,
          parentSpaceId: (data?.space?.parentSpaces ?? []).slice(-1)[0],
          journeyPath: journeyPath,

          // Collaboration:
          collaborationId: data?.space?.collaboration.id,
          calloutsSetId: data?.space?.collaboration.calloutsSetId,
          calloutId: data?.space?.collaboration.calloutId,
          contributionId: data?.space?.collaboration.contributionId,
          postId: data?.space?.collaboration.postId,
          whiteboardId: data?.space?.collaboration.whiteboardId,

          // Contributors:
          organizationId: data?.organizationId,
          userId: data?.userId,
          vcId: data?.vcId,

          // Innovation Packs:
          innovationPackId: data?.innovationPack?.id,

          // Templates:
          templatesSetId: data?.space?.templatesSet?.id ?? data?.innovationPack?.templatesSet.id,
          templateId: data?.space?.templatesSet?.templateId ?? data?.innovationPack?.templatesSet.templateId,

          // Forum:
          discussionId: data?.discussionId,

          // PENDING
          innovationHubId: undefined,
          loading: urlResolverLoading,
        };
        // }, [currentUrl, urlResolverData, urlResolverLoading]);
      })();
      cache.current[currentUrl] = result;
      value.current = result;
    }
  }
  console.log('render', window.location.href, currentUrl, value.current);

  return <UrlResolverContext.Provider value={value.current}>{children}</UrlResolverContext.Provider>;
};

export { UrlResolverProvider, UrlResolverContext };
