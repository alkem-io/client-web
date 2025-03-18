import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { SearchResultType } from '@/core/apollo/generated/graphql-schema';

export interface FilterDefinition {
  title: TranslationKey;
  value: SearchResultType[];
  typename: string;
  disabled?: boolean;
}

export interface FilterConfig {
  [key: string]: FilterDefinition;
}

export const journeyFilterConfig: FilterConfig = {
  all: {
    title: 'pages.search.filter.key.all',
    value: [SearchResultType.Space, SearchResultType.Subspace],
    typename: 'all',
  },
  space: {
    title: 'pages.search.filter.key.space',
    value: [SearchResultType.Space],
    typename: 'space',
  },
  subspace: {
    title: 'pages.search.filter.key.subspace',
    value: [SearchResultType.Subspace],
    typename: 'subspace',
  },
};

export const calloutFilterConfig: FilterConfig = {
  all: {
    title: 'pages.search.filter.key.all',
    value: [SearchResultType.Callout],
    typename: 'all',
  },
};

/* TODO: Disabled Callout filters for now.
Object.values(CalloutType).reduce(
  (filterConfig, calloutType) => {
    return {
      ...filterConfig,
      [calloutType]: {
        title: `common.enums.calloutType.${calloutType}`,
        value: [calloutType],
        typename: calloutType,
      },
    } as FilterConfig;
  },
  {
    all: {
      title: 'common.all',
      value: Object.values(CalloutType), // TODO: I think this should be `.keys`
      typename: 'all',
    },
  } as FilterConfig
);*/

export const contributionFilterConfig: FilterConfig = {
  all: {
    title: 'pages.search.filter.key.all',
    value: [SearchResultType.Post, SearchResultType.Whiteboard],
    typename: 'all',
  },
  post: {
    title: 'pages.search.filter.key.post',
    value: [SearchResultType.Post],
    typename: 'post',
  },
  whiteboard: {
    title: 'pages.search.filter.key.whiteboard',
    value: [SearchResultType.Whiteboard],
    typename: 'whiteboard',
    disabled: true, // TODO: Needs server work
  },
};

export const contributorFilterConfig: FilterConfig = {
  all: {
    title: 'pages.search.filter.key.all',
    value: [SearchResultType.User, SearchResultType.Organization],
    typename: 'all',
  },
  user: {
    title: 'pages.search.filter.key.user',
    value: [SearchResultType.User],
    typename: 'user',
  },
  organization: {
    title: 'pages.search.filter.key.organization',
    value: [SearchResultType.Organization],
    typename: 'organization',
  },
};
