import CalloutCard, { type CalloutCardCallout } from '@/domain/collaboration/callout/calloutCard/CalloutCard';
import type { SearchResultMetaType } from '../SearchView';
import SearchResultPostChooser from './SearchResultPostChooser';
import SearchResultsCalloutCardFooter, {
  type SearchResultsCalloutCardFooterProps,
} from './searchResultsCallout/SearchResultsCalloutCardFooter';

interface SearchResultsCalloutAndFramingCardProps {
  result:
    | {
        id: string;
        callout: CalloutCardCallout & SearchResultsCalloutCardFooterProps['callout'];
        matchedTerms?: string[];
        space: SearchResultsCalloutCardFooterProps['space'];
        type: 'CALLOUT';
      }
    | SearchResultMetaType
    | undefined;
}

const SearchResultsCalloutAndFramingCard = ({ result }: SearchResultsCalloutAndFramingCardProps) => {
  if (!result) {
    return null;
  }
  if (result.type === 'CALLOUT') {
    return <CalloutCard callout={result.callout} footer={<SearchResultsCalloutCardFooter {...result} />} />;
  } else {
    return <SearchResultPostChooser result={result} />;
  }
};

export default SearchResultsCalloutAndFramingCard;
