import TranslationKey from '@core/i18n/utils/TranslationKey';

export interface FilterDefinition {
  title: TranslationKey;
  value: string[];
  typename: string;
  disabled?: boolean;
}

export interface FilterConfig {
  [key: string]: FilterDefinition;
}

export const journeyFilterConfig: FilterConfig = {
  all: {
    title: 'pages.search.filter.key.all',
    value: ['space', 'subspace'],
    typename: 'all',
  },
  space: {
    title: 'pages.search.filter.key.space',
    value: ['space'],
    typename: 'space',
  },
  subspace: {
    title: 'pages.search.filter.key.subspace',
    value: ['subspace'],
    typename: 'subspace',
  },
};

export const calloutFilterConfig: FilterConfig = {
  all: {
    title: 'pages.search.filter.key.all',
    value: ['callout'],
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
    value: ['post'],
    typename: 'all',
  },
  post: {
    title: 'pages.search.filter.key.post',
    value: ['post'],
    typename: 'post',
  },
  whiteboard: {
    title: 'pages.search.filter.key.whiteboard',
    value: ['whiteboard'],
    typename: 'whiteboard',
    disabled: true, // TODO: Needs server work
  },
};

export const contributorFilterConfig: FilterConfig = {
  all: {
    title: 'pages.search.filter.key.all',
    value: ['user', 'organization'],
    typename: 'all',
  },
  user: {
    title: 'pages.search.filter.key.user',
    value: ['user'],
    typename: 'user',
  },
  organization: {
    title: 'pages.search.filter.key.organization',
    value: ['organization'],
    typename: 'organization',
  },
};
