import PageContent from '../../core/ui/content/PageContent';
import PageContentColumn from '../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../core/ui/content/PageContentBlock';
import { GUTTER_MUI } from '../../core/ui/grid/constants';
import { BlockTitle, PageTitle, Text } from '../../core/ui/typography';
import PageContentBlockGrid from '../../core/ui/content/PageContentBlockGrid';
import PageContentBlockHeader from '../../core/ui/content/PageContentBlockHeader';
import CalloutCard, { CalloutCardCallout } from '../../domain/collaboration/callout/calloutCard/CalloutCard';
import SearchResultsCalloutCardFooter, {
  SearchResultsCalloutCardFooterProps,
} from '../../main/search/searchResults/searchResultsCallout/SearchResultsCalloutCardFooter';
import { CalloutContributionType, CalloutState, CalloutType } from '../../core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../domain/journey/JourneyTypeName';

const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

interface SearchResult {
  callout: CalloutCardCallout & SearchResultsCalloutCardFooterProps['callout'];
  matchedTerms: string[];
  journeyTypeName: JourneyTypeName;
  journeyDisplayName: string;
}

const searchResults: SearchResult[] = [
  {
    callout: {
      profile: {
        description: loremIpsum,
        displayName: 'Callout 1',
        tagset: {
          tags: ['callout', 'card'],
        },
      },
      type: CalloutType.Post,
      contributionPolicy: {
        allowedContributionTypes: [
          CalloutContributionType.Whiteboard,
          CalloutContributionType.Post,
          CalloutContributionType.Link,
        ],
        state: CalloutState.Open,
      },
      contributions: [
        {
          post: { id: 'post' },
        },
        {
          whiteboard: { id: 'whiteboard' },
        },
      ],
      comments: {
        messagesCount: 0,
      },
    },
    matchedTerms: ['callout', 'card'],
    journeyTypeName: 'challenge',
    journeyDisplayName: 'Parent Challenge',
  },
  {
    callout: {
      profile: {
        description: loremIpsum,
        displayName: 'Callout 2',
        tagset: {
          tags: [],
        },
      },
      type: CalloutType.LinkCollection,
      contributionPolicy: {
        allowedContributionTypes: [CalloutContributionType.Link],
        state: CalloutState.Open,
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
    journeyTypeName: 'space',
    journeyDisplayName: 'Parent Space',
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
          <PageContentBlock accent>
            <BlockTitle>Callout Search Cards</BlockTitle>
            <Text>{loremIpsum}</Text>
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={8}>
          <PageContentBlock>
            <PageContentBlockHeader title="Callout Search Cards" />
            <PageContentBlockGrid disablePadding cards>
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
