import { SearchBaseJourneyCardProps } from './base/SearchBaseJourneyCard';
import { SearchJourneyCardProps } from './SearchJourneyCardProps';

export interface SearchJourneyWithParentCardProps extends SearchJourneyCardProps {
  parentName: string;
}