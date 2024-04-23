import TranslationKey from '../../core/i18n/utils/TranslationKey';
import { CalloutType } from '../../core/apollo/generated/graphql-schema';

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
    value: ['space', 'opportunity', 'challenge'],
    typename: 'all',
  },
  space: {
    title: 'pages.search.filter.key.space',
    value: ['space'],
    typename: 'space',
  },
  challenge: {
    title: 'pages.search.filter.key.challenge',
    value: ['challenge'],
    typename: 'challenge',
  },
  opportunity: {
    title: 'pages.search.filter.key.opportunity',
    value: ['opportunity'],
    typename: 'opportunity',
  },
};

export const calloutFilterConfig: FilterConfig = Object.values(CalloutType).reduce(
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
      value: Object.values(CalloutType),
      typename: 'all',
    },
  } as FilterConfig
);

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
  callout: {
    title: 'pages.search.filter.key.callout',
    value: ['callout'],
    typename: 'callout',
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
