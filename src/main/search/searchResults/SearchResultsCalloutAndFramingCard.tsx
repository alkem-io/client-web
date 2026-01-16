import CalloutCard, { CalloutCardCallout } from '@/domain/collaboration/callout/calloutCard/CalloutCard';
import SearchResultsCalloutCardFooter, {
  SearchResultsCalloutCardFooterProps,
} from './searchResultsCallout/SearchResultsCalloutCardFooter';
import { SearchResultMetaType } from '../SearchView';
import SearchResultPostChooser from './SearchResultPostChooser';

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
    return (
      <CalloutCard
        callout={result.callout}
        to={result.callout.framing.profile.url}
        footer={<SearchResultsCalloutCardFooter {...result} />}
      />
    );
  } else {
    return <SearchResultPostChooser result={result} />;
  }
};

export default SearchResultsCalloutAndFramingCard;
