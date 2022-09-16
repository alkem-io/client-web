import React, { ReactElement } from 'react';
import Skeleton from '@mui/material/Skeleton';
import EntitySearchCardProps from '../../common/components/composite/search/EntitySearchCardProps';
import {
  ChallengeSearchCard,
  OpportunitySearchCard,
  OrganizationSearchCard,
  UserCard,
} from '../../common/components/composite/search';
import { Challenge, Opportunity, Organization, User } from '../../models/graphql-schema';
import { ResultType } from './SearchPage';

const SearchResultCardChooser = ({ result }: { result: ResultType | undefined }) => {
  if (!result || !result.__typename) {
    // todo better skeleton
    return <Skeleton width="200px" height="250px" />;
  }

  const cardDict: Record<NonNullable<ResultType['__typename']>, ReactElement<EntitySearchCardProps<unknown>>> = {
    User: <UserCard key={result.id} {...(result as User)} />,
    Opportunity: <OpportunitySearchCard key={result.id} terms={result.terms} entity={result as Opportunity} />,
    Organization: <OrganizationSearchCard key={result.id} terms={result.terms} entity={result as Organization} />,
    Challenge: <ChallengeSearchCard key={result.id} terms={result.terms} entity={result as Challenge} />,
  };

  if (result.__typename === 'User') return <UserCard key={result.id} {...result} />;
  if (result.__typename === 'Opportunity')
    return <OpportunitySearchCard key={result.id} terms={result.terms} entity={result} />;
  if (result.__typename === 'Organization')
    return <OrganizationSearchCard key={result.id} terms={result.terms} entity={result} />;
  if (result.__typename === 'Challenge')
    return <ChallengeSearchCard key={result.id} terms={result.terms} entity={result} />;

  const card = cardDict[result.__typename];

  if (!card) {
    throw new Error(`Unrecognized result typename: ${result.__typename}`);
  }

  return card;
};
export default SearchResultCardChooser;
