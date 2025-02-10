import { useUrlResolverQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceLevel, UrlType } from '@/core/apollo/generated/graphql-schema';
import { PartialRecord } from '@/core/utils/PartialRecords';
import { compact } from 'lodash';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';

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

  // Innovation Hubs
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

/**
 * Helper function to choose between two urlResolver results objects and generate the urlResolver result based on the selected one
 * For example, spaces have a calloutSet, but also VCs have a calloutSet.
 * This function can select the correct one based on the urlType
 *
 * @param values An object coming from the urlResolverService
 *   for example something like:{
 *    [UrlType.Space]: Space.Collaboration { CalloutsSet { id: '123', calloutId: '456' ...} }
 *    [UrlType.VirtualContributor]: VC.KnowledgeBase { CalloutsSet { id: '789', calloutId: '001' ...} }
 * @param urlType the type to use
 * @param generate A function that should generate the result based on the object selected by urlType
 * @returns
 */
const selectUrlParams = <T extends {}, R extends {}>(
  urlType: UrlType,
  values: PartialRecord<UrlType, Partial<T | undefined>>,
  generate: (values: Partial<T> | undefined) => R
): R => generate(values[urlType] ?? undefined);

const UrlResolverContext = createContext<UrlResolverContextValue>(emptyResult);

const UrlResolverProvider = ({ children }: { children: ReactNode }) => {
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

  /**
   * Default Apollo's cache behaviour will store the result of the URL resolver queries based on the Id of the space returned
   * And will fill the gaps of missing Ids when the user navigates to a different URL
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
   * To avoid this, we are have modified the typePolicies we have disabled the keyFields for the UrlResolver queries and we are using the URL as the key
   * This way, the cache will store the entire result of the query based on the URL, and will not try to merge the results of different queries.
   */
  const { data: urlResolverData, loading: urlResolverLoading } = useUrlResolverQuery({
    variables: {
      url: currentUrl,
    },
  });

  const result = useMemo<UrlResolverContextValue>(() => {
    if (urlResolverData?.urlResolver.type) {
      const type = urlResolverData.urlResolver.type;
      const data = urlResolverData.urlResolver;
      const spaceId = data?.space?.id;
      const spacesIds = compact([...(data?.space?.parentSpaces ?? []), spaceId]);
      const journeyPath = spacesIds.length > 0 ? (spacesIds as JourneyPath) : undefined;

      return {
        type,
        // Space:
        spaceId: data.space?.id,
        spaceLevel: data.space?.level,
        levelZeroSpaceId: data.space?.levelZeroSpaceID,
        parentSpaceId: (data.space?.parentSpaces ?? []).slice(-1)[0],
        journeyPath: journeyPath,

        // Collaboration:
        collaborationId: data.space?.collaboration.id,

        // CalloutsSet:
        ...selectUrlParams(
          type,
          {
            [UrlType.Space]: data.space?.collaboration.calloutsSet,
            [UrlType.VirtualContributor]: data.virtualContributor?.calloutsSet,
          },
          calloutsSet => ({
            calloutsSetId: calloutsSet?.id,
            calloutId: calloutsSet?.calloutId,
            contributionId: calloutsSet?.contributionId,
            postId: calloutsSet?.postId,
            whiteboardId: calloutsSet?.['whiteboardId'], // No whiteboards yet on VCKBs, so TypeScript is complaining
          })
        ),

        // Contributors:
        organizationId: data.organizationId,
        userId: data.userId,
        vcId: data.virtualContributor?.id,

        // Innovation Packs:
        innovationPackId: data.innovationPack?.id,

        // InnovationHub:
        innovationHubId: data.innovationHubId,

        // Templates:
        ...selectUrlParams(
          type,
          {
            [UrlType.Space]: data.space?.templatesSet,
            [UrlType.InnovationPacks]: data.innovationPack?.templatesSet,
          },
          templatesSet => ({
            templatesSetId: templatesSet?.id,
            templateId: templatesSet?.templateId,
          })
        ),

        // Forum:
        discussionId: data.discussionId,

        loading: urlResolverLoading,
      };
    } else {
      return emptyResult;
    }
  }, [currentUrl, urlResolverData, urlResolverLoading]);

  return <UrlResolverContext.Provider value={result}>{children}</UrlResolverContext.Provider>;
};

export { UrlResolverProvider, UrlResolverContext };
