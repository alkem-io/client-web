import { useUrlResolverQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceLevel, UrlType } from '@/core/apollo/generated/graphql-schema';
import { isUrlResolverError } from '@/core/apollo/hooks/useApolloErrorHandler';
import { NotFoundError } from '@/core/notFound/NotFoundErrorBoundary';
import { PartialRecord } from '@/core/utils/PartialRecord';
import { compact } from 'lodash';
import { createContext, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { TabbedLayoutParams } from '../urlBuilders';

export type SpaceHierarchyPath = [] | [string] | [string, string] | [string, string, string];

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
  spaceHierarchyPath: SpaceHierarchyPath | undefined;
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

  // Calendar:
  calendarId: string | undefined;
  calendarEventId: string | undefined;

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
  spaceHierarchyPath: [],
  parentSpaceId: undefined,
  collaborationId: undefined,
  calloutsSetId: undefined,
  calloutId: undefined,
  contributionId: undefined,
  postId: undefined,
  whiteboardId: undefined,
  calendarId: undefined,
  calendarEventId: undefined,
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
  const [currentUrl, setCurrentUrl] = useState<string>('');
  /**
   * Default Apollo's cache behavior will store the result of the URL resolver queries based on the Id of the space returned
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
   * To avoid this, we have modified the typePolicies we have disabled the keyFields for the UrlResolver queries and we are using the URL as the key
   * This way, the cache will store the entire result of the query based on the URL, and will not try to merge the results of different queries.
   */
  const {
    data: urlResolverData,
    error,
    loading: urlResolverLoading,
  } = useUrlResolverQuery({
    variables: {
      url: currentUrl!,
    },
    skip: !currentUrl,
  });

  if (!urlResolverLoading && error && isUrlResolverError(error)) {
    throw new NotFoundError();
  }

  useEffect(() => {
    // strip parts of the URL that go below the resolved wentity
    const maskedUrlParts = [
      // Remove anything after /settings, because it's the settings url of the same entity, no need to resolve it:
      /\/settings(?:\/[a-zA-Z0-9-]+)?\/?$/,
      // Remove tabs from the URL as well
      `/${TabbedLayoutParams.Section}(?:/[a-zA-Z0-9-]+)?/?$`,
    ];
    const handleUrlChange = () => {
      let nextUrl = window.location.origin + window.location.pathname;

      // Remove trailing slash because /:spaceNameId and /:spaceNameId/ are the same url
      if (nextUrl.endsWith('/')) {
        nextUrl = nextUrl.slice(0, -1);
      }

      // TODO: We need to rework the Urls of the templates anyway. See #8061
      // For now just don't do anything, if the url is /innovation-packs/:innovationPackNameId/settings/:templateNameId let it pass to the urlResolver
      // Remove anything after /settings, because it's the settings url of the same entity, no need to resolve it:
      if (!/\/innovation-packs\/[a-zA-Z0-9-]+\/settings\/[a-zA-Z0-9-]+/.test(nextUrl)) {
        for (const mask of maskedUrlParts) {
          nextUrl = nextUrl.replace(mask, '');
        }
      }

      if (nextUrl !== currentUrl) {
        setCurrentUrl(nextUrl); // Update the query URL state
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    var pushState = window.history.pushState;
    window.history.pushState = function (...args) {
      pushState.apply(window.history, args);
      handleUrlChange();
    };

    handleUrlChange();

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // create cache for the resolver value
  const valueRef = useRef<UrlResolverContextValue>(emptyResult);
  const value = useMemo<UrlResolverContextValue>(() => {
    // start generating the context value on successfull request
    if (urlResolverData?.urlResolver.type) {
      const type = urlResolverData.urlResolver.type;
      const data = urlResolverData.urlResolver;
      const spaceId = data?.space?.id;
      const spacesIds = compact([...(data?.space?.parentSpaces ?? []), spaceId]);
      const spaceHierarchyPath = spacesIds.length > 0 ? (spacesIds as SpaceHierarchyPath) : undefined;

      const value = {
        type,
        // Space:
        spaceId: data.space?.id,
        spaceLevel: data.space?.level,
        levelZeroSpaceId: data.space?.levelZeroSpaceID,
        parentSpaceId: (data.space?.parentSpaces ?? []).slice(-1)[0],
        spaceHierarchyPath: spaceHierarchyPath,

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

        // Calendar:
        calendarId: data.space?.calendar?.id,
        calendarEventId: data.space?.calendar?.calendarEventId,

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
      // store in the cache
      valueRef.current = value;
      return value;
    }
    // return the cached value until the new request is resolved
    if (urlResolverLoading) {
      return valueRef.current;
    }
    // if the value is not resolved and loading is complete return empty result
    return emptyResult;
  }, [urlResolverData, urlResolverLoading]);

  return <UrlResolverContext.Provider value={value}>{children}</UrlResolverContext.Provider>;
};

export { UrlResolverProvider, UrlResolverContext };
