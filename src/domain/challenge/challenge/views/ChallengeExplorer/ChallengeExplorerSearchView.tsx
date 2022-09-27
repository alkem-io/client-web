import React, { FC } from 'react';
import DashboardGenericSection from '../../../../shared/components/DashboardSections/DashboardGenericSection';
import GroupBy from '../../../../../common/components/core/GroupBy/GroupBy';
import ChallengeExplorerSearchEnricherContainer from '../../containers/ChallengeExplorerSearch/ChallengeExplorerSearchEnricherContainer';
import ChallengeExplorerHubDataResolver from '../../containers/ChallengeExplorerSearch/ChallengeExplorerHubDataResolver';
import { ChallengeExplorerSearchResultFragment } from '../../../../../models/graphql-schema';
import ChallengeCard from '../../../../../common/components/composite/common/cards/ChallengeCard/ChallengeCard';
import CardsLayout from '../../../../shared/layout/CardsLayout/CardsLayout';
import { HubIcon } from '../../../../../common/icons/HubIcon';

export type ChallengeExplorerGroupByType = 'hub';

export interface ChallengeExplorerSearchViewProps {
  challenges: ChallengeExplorerSearchResultFragment[] | undefined;
  groupBy: ChallengeExplorerGroupByType;
}

const ChallengeExplorerSearchView: FC<ChallengeExplorerSearchViewProps> = ({ challenges, groupBy }) => {
  const groupKey = getGroupKey(groupBy);

  if (!groupKey) {
    return null;
  }

  return (
    <>
      {challenges && challenges.length > 0 && (
        <GroupBy data={challenges} groupKey={groupKey}>
          {groups => {
            return groups.map(({ keyValue, values }) => (
              <ChallengeExplorerHubDataResolver key={keyValue} hubId={keyValue}>
                {({ displayName, tagline }) => (
                  <DashboardGenericSection headerText={displayName} headerIcon={<HubIcon />} subHeaderText={tagline}>
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
                  </DashboardGenericSection>
                )}
              </ChallengeExplorerHubDataResolver>
            ));
          }}
        </GroupBy>
      )}
    </>
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
