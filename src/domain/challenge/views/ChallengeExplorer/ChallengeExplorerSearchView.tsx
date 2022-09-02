import React, { FC } from 'react';
import { Accordion } from '../../../../common/components/composite/common/Accordion/Accordion';
import GroupBy from '../../../../common/components/core/GroupBy/GroupBy';
import ChallengeExplorerSearchContainer from '../../../../containers/challenge/ChallengeExplorerSearch/ChallengeExplorerSearchContainer';
import ChallengeExplorerSearchEnricherContainer from '../../../../containers/challenge/ChallengeExplorerSearch/ChallengeExplorerSearchEnricherContainer';
import HubNameResolver from '../../../../containers/hub/HubNameResolver';
import { ChallengeExplorerSearchResultFragment } from '../../../../models/graphql-schema';
import ChallengeCard from '../../../../common/components/composite/common/cards/ChallengeCard/ChallengeCard';
import CardsLayout from '../../../shared/layout/CardsLayout/CardsLayout';

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
      {({ challenges }) =>
        challenges.length > 0 && (
          <GroupBy data={challenges} groupKey={groupKey}>
            {groups => {
              return groups.map(({ keyValue, values }) => (
                <HubNameResolver key={keyValue} hubId={keyValue}>
                  {({ displayName }) => (
                    <Accordion title={displayName} ariaKey={keyValue}>
                      <CardsLayout items={values}>
                        {challenge => (
                          // TODO enrich at the level of the LayoutContainer
                          <ChallengeExplorerSearchEnricherContainer challenge={challenge}>
                            {({ challenge: enrichedChallenge }) => (
                              <ChallengeCard challenge={enrichedChallenge} hubNameId={challenge.hubID} />
                            )}
                          </ChallengeExplorerSearchEnricherContainer>
                        )}
                      </CardsLayout>
                    </Accordion>
                  )}
                </HubNameResolver>
              ));
            }}
          </GroupBy>
        )
      }
    </ChallengeExplorerSearchContainer>
  );
};
export default ChallengeExplorerSearchView;

const getGroupKey = (
  groupBy: ChallengeExplorerGroupByType
): keyof ChallengeExplorerSearchResultFragment | undefined => {
  switch (groupBy) {
    case 'hub':
      return 'hubID';
    default:
      return undefined;
  }
};
