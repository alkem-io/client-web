import CalloutCard, { CalloutCardCallout } from '@/domain/collaboration/callout/calloutCard/CalloutCard';
import SearchResultsCalloutCardFooter, { SearchResultsCalloutCardFooterProps } from './SearchResultsCalloutCardFooter';

interface SearchResultsCalloutCardProps {
  result:
    | {
        id: string;
        callout: CalloutCardCallout & SearchResultsCalloutCardFooterProps['callout'];
        matchedTerms?: string[];
        space: SearchResultsCalloutCardFooterProps['space'];
      }
    | undefined;
}

const SearchResultsCalloutCard = ({ result }: SearchResultsCalloutCardProps) => {
  if (!result) {
    return null;
  }

  return <CalloutCard callout={result.callout} footer={<SearchResultsCalloutCardFooter {...result} />} />;
};

export default SearchResultsCalloutCard;
