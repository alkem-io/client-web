import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { GUTTER_MUI } from '@/core/ui/grid/constants';
import { BlockTitle, PageTitle, Text } from '@/core/ui/typography';
import CalloutCard, { type CalloutCardCallout } from '@/domain/collaboration/callout/calloutCard/CalloutCard';
import SearchResultsCalloutCardFooter, {
  type SearchResultsCalloutCardFooterProps,
} from '@/main/search/searchResults/searchResultsCallout/SearchResultsCalloutCardFooter';

const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

interface SearchResult {
  callout: CalloutCardCallout & SearchResultsCalloutCardFooterProps['callout'];
  space: SearchResultsCalloutCardFooterProps['space'];
  matchedTerms: string[];
}

const searchResults: SearchResult[] = [
  {
    callout: {
      framing: {
        profile: {
          description: loremIpsum,
          displayName: 'Callout 1',
          tagset: {
            tags: ['callout', 'card'],
          },
          url: '/demo-callout',
        },
      },
      contributions: [
        {
          post: { id: 'post' },
        },
      ],
      comments: {
        messagesCount: 3,
      },
    },
    matchedTerms: ['callout', 'card'],
    space: {
      about: {
        profile: {
          displayName: 'Parent Space',
          url: '/space1',
        },
      },
      level: SpaceLevel.L1,
    },
  },
  {
    callout: {
      framing: {
        profile: {
          description: loremIpsum,
          displayName: 'Callout 2',
          tagset: {
            tags: [],
          },
          url: '/demo-callout-2',
        },
      },
      contributions: [
        {
          link: { id: 'link' },
        },
      ],
      comments: {
        messagesCount: 21,
      },
    },
    matchedTerms: ['matched', 'terms'],
    space: {
      about: {
        profile: {
          displayName: 'Parent Space',
          url: '/space2',
        },
      },
      level: SpaceLevel.L0,
    },
  },
];

const SearchCardsDemo = () => {
  return (
    <>
      <PageTitle textAlign="center" paddingY={GUTTER_MUI}>
        Callout Search Cards Demo
      </PageTitle>
      <PageContent>
        <PageContentColumn columns={4}>
          <PageContentBlock accent={true}>
            <BlockTitle>Callout Search Cards</BlockTitle>
            <Text>{loremIpsum}</Text>
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={8}>
          <PageContentBlock>
            <PageContentBlockHeader title="Callout Search Cards" />
            <PageContentBlockGrid disablePadding={true} cards={true}>
              {searchResults.map(({ callout, ...result }) => (
                <CalloutCard
                  callout={callout}
                  footer={<SearchResultsCalloutCardFooter callout={callout} {...result} />}
                />
              ))}
            </PageContentBlockGrid>
          </PageContentBlock>
        </PageContentColumn>
      </PageContent>
    </>
  );
};

export default SearchCardsDemo;
