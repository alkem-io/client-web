import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { SearchResultType } from '@/core/apollo/generated/graphql-schema';

export const FILTER_OFF = 'all';

export interface FilterDefinition {
  title: TranslationKey;
  value: SearchResultType[];
  typename: string;
  disabled?: boolean;
}

export interface FilterConfig {
  [key: string]: FilterDefinition;
}

export const spaceFilterConfig: FilterConfig = {
  all: {
    title: 'pages.search.filter.key.all',
    value: [SearchResultType.Space, SearchResultType.Subspace],
    typename: FILTER_OFF,
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

// export const calloutFilterConfig: FilterConfig = {
//   all: {
//     title: 'pages.search.filter.key.all',
//     value: [SearchResultType.Callout],
//     typename: FILTER_OFF,
//   },
// };

// export const framingFilterConfig: FilterConfig = {
//   all: {
//     title: 'pages.search.filter.key.all',
//     value: [SearchResultType.Whiteboard, SearchResultType.Memo],
//     typename: FILTER_OFF,
//   },
//   whiteboard: {
//     title: 'pages.search.filter.key.whiteboard',
//     value: [SearchResultType.Whiteboard],
//     typename: 'whiteboard',
//   },
//   memo: {
//     title: 'pages.search.filter.key.memo',
//     value: [SearchResultType.Memo],
//     typename: 'memo',
//   },
// };

export const calloutAndFramingFilterConfig: FilterConfig = {
  all: {
    title: 'pages.search.filter.key.all',
    value: [SearchResultType.Callout, SearchResultType.Whiteboard, SearchResultType.Memo],
    typename: FILTER_OFF,
  },
  whiteboard: {
    title: 'pages.search.filter.key.whiteboard',
    value: [SearchResultType.Whiteboard],
    typename: 'whiteboard',
  },
  memo: {
    title: 'pages.search.filter.key.memo',
    value: [SearchResultType.Memo],
    typename: 'memo',
  },
};

export const contributionFilterConfig: FilterConfig = {
  all: {
    title: 'pages.search.filter.key.all',
    value: [SearchResultType.Post, SearchResultType.Whiteboard, SearchResultType.Memo],
    typename: FILTER_OFF,
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
  },
  memo: {
    title: 'pages.search.filter.key.memo',
    value: [SearchResultType.Memo],
    typename: 'memo',
  },
};

export const contributorFilterConfig: FilterConfig = {
  all: {
    title: 'pages.search.filter.key.all',
    value: [SearchResultType.User, SearchResultType.Organization],
    typename: FILTER_OFF,
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
