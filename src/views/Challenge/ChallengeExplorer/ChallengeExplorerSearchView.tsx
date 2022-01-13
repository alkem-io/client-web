import React, { FC } from 'react';
import { Accordion } from '../../../components/composite/common/Accordion/Accordion';
import GroupBy from '../../../components/core/GroupBy/GroupBy';
import ChallengeExplorerSearchContainer from '../../../containers/challenge/ChallengeExplorerSearch/ChallengeExplorerSearchContainer';
import ChallengeExplorerSearchEnricherContainer from '../../../containers/challenge/ChallengeExplorerSearch/ChallengeExplorerSearchEnricherContainer';
import EcoverseNameResolver from '../../../containers/ecoverse/EcoverseNameResolver';
import { ChallengeExplorerSearchResultFragment } from '../../../models/graphql-schema';
import ChallengeCard, {
  ChallengeCardProps,
} from '../../../components/composite/common/cards/ChallengeCard/ChallengeCard';
import { CardWrapper, CardWrapperItem } from '../../../components/core/CardWrapper/CardWrapper';

export type ChallengeExplorerGroupByType = 'hub';

export interface ChallengeExplorerSearchViewProps {
  terms: string[];
  groupBy: ChallengeExplorerGroupByType;
}

const ChallengeExplorerSearchView: FC<ChallengeExplorerSearchViewProps> = ({ terms, groupBy }) => {
  const groupKey = getGroupKey(groupBy);

  if (!groupKey) {
    return null;
  }

  return (
    <ChallengeExplorerSearchContainer terms={terms}>
      {({ challenges }) => (
        <GroupBy data={challenges} groupKey={groupKey}>
          {groups => {
            return groups.map(({ keyValue, values }) => (
              <EcoverseNameResolver key={keyValue} ecoverseId={keyValue}>
                {({ displayName }) => (
                  <Accordion title={displayName} ariaKey={keyValue}>
                    <CardWrapper>
                      {values.map((value, i) => (
                        <ChallengeExplorerSearchEnricherContainer key={i} challenge={value}>
                          {({ challenge }) => (
                            <CardWrapperItem>
                              <ChallengeCard
                                challenge={challenge as ChallengeCardProps['challenge']}
                                ecoverseNameId={challenge.ecoverseID}
                              />
                            </CardWrapperItem>
                          )}
                        </ChallengeExplorerSearchEnricherContainer>
                      ))}
                    </CardWrapper>
                  </Accordion>
                )}
              </EcoverseNameResolver>
            ));
          }}
        </GroupBy>
      )}
    </ChallengeExplorerSearchContainer>
  );
};
export default ChallengeExplorerSearchView;

const getGroupKey = (
  groupBy: ChallengeExplorerGroupByType
): keyof ChallengeExplorerSearchResultFragment | undefined => {
  switch (groupBy) {
    case 'hub':
      return 'ecoverseID';
    default:
      return undefined;
  }
};
