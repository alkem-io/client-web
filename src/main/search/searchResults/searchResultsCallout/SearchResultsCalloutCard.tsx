import CalloutCard, { CalloutCardCallout } from '../../../../domain/collaboration/callout/calloutCard/CalloutCard';
import SearchResultsCalloutCardFooter, { SearchResultsCalloutCardFooterProps } from './SearchResultsCalloutCardFooter';
import { JourneyTypeName } from '../../../../domain/journey/JourneyTypeName';

interface SearchResultsCalloutCardProps {
  result:
    | {
        id: string;
        callout: CalloutCardCallout & SearchResultsCalloutCardFooterProps['callout'];
        matchedTerms: string[];
        journeyTypeName: JourneyTypeName;
        journeyDisplayName: string;
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
