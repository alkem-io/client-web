import React, { FC } from 'react';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import { SearchJourneyCardProps, SearchJourneyCard } from './SearchJourneyCard';

export interface SearchHubCardProps /*extends SearchJourneyCardProps*/ {}

export const SearchHubCard: FC<SearchHubCardProps> = ({}) => {
  return (
    <SearchJourneyCard
      icon={HubOutlinedIcon}
      name={'Display name'}
      label={'Member'}
      taglineTitle={'Hub info'}
      tagline={
        '[tagline] Openstaan voor innovatie uit alle perspectieven. Samen maak je een dorp en dus ook ons online bestaan. '
      }
      image={'http://localhost:3000/ipfs/QmRP176WvvbMGFeU3KwG1zEjYbitYCq3jMm4nDYzcHty9y'}
      matchedTerms={['term1', 'long-term-2', 'term3', 'term4']}
      url={''}
    />
  );
};
