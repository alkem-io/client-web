import React, { FC } from 'react';
import { CardContainer } from '../../../components/core/CardContainer';
import ChallengeExplorerSearchEnricherContainer from '../../../containers/challenge/ChallengeExplorerSearch/ChallengeExplorerSearchEnricherContainer';
import { ActivityItem } from '../../../components/composite/common/ActivityPanel/Activities';
import getActivityCount from '../../../utils/get-activity-count';
import ContributionCard from '../../../components/composite/common/cards/ContributionCard/ContributionCard';
import { buildChallengeUrl } from '../../../utils/urlBuilders';
import ChallengeExplorerSearchContainer from '../../../containers/challenge/ChallengeExplorerSearch/ChallengeExplorerSearchContainer';
import { useTranslation } from 'react-i18next';
import GroupBy from '../../../components/core/GroupBy/GroupBy';
import { ChallengeExplorerSearchResultFragment } from '../../../models/graphql-schema';
import { Accordion } from '../../../components/composite/common/Accordion/Accordion';
import EcoverseNameResolver from '../../../containers/ecoverse/EcoverseNameResolver';

export type ChallengeExplorerGroupByType = 'hub';

export interface ChallengeExplorerSearchViewProps {
  terms: string[];
  groupBy: ChallengeExplorerGroupByType;
}

const ChallengeExplorerSearchView: FC<ChallengeExplorerSearchViewProps> = ({ terms, groupBy }) => {
  const { t } = useTranslation();

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
                    <CardContainer>
                      {values.map((value, i) => (
                        <ChallengeExplorerSearchEnricherContainer key={i} challenge={value}>
                          {({ challenge }, state) => {
                            const _activity = value.activity ?? [];
                            const activities: ActivityItem[] = [
                              {
                                name: t('pages.activity.opportunities'),
                                digit: getActivityCount(_activity, 'opportunities') || 0,
                                color: 'primary',
                              },
                              {
                                name: t('pages.activity.members'),
                                digit: getActivityCount(_activity, 'members') || 0,
                                color: 'positive',
                              },
                            ];
                            return (
                              <ContributionCard
                                loading={state.loading}
                                details={{
                                  name: challenge.displayName,
                                  activity: activities,
                                  tags: challenge.tagset?.tags ?? [],
                                  image: challenge.context?.visual?.background ?? '',
                                  url: challenge.hubNameId && buildChallengeUrl(challenge.hubNameId, challenge.nameID),
                                }}
                              />
                            );
                          }}
                        </ChallengeExplorerSearchEnricherContainer>
                      ))}
                    </CardContainer>
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
