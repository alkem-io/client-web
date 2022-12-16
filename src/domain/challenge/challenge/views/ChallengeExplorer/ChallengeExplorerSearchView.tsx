import React, { FC, useCallback } from 'react';
import DashboardGenericSection from '../../../../shared/components/DashboardSections/DashboardGenericSection';
import GroupBy from '../../../../../common/components/core/GroupBy/GroupBy';
import CardsLayout from '../../../../shared/layout/CardsLayout/CardsLayout';
import { HubIcon } from '../../../hub/icon/HubIcon';
import { SearchChallengeCard } from '../../../../shared/components/search-cards';
import { SimpleChallengeWithSearchTerms } from '../../containers/ChallengeExplorerContainer';
import CardsLayoutScroller from '../../../../shared/layout/CardsLayout/CardsLayoutScroller';
import { useUserContext } from '../../../../community/contributor/user';
import { RoleType } from '../../../../community/contributor/user/constants/RoleType';
import { buildChallengeUrl } from '../../../../../common/utils/urlBuilders';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SectionSpacer from '../../../../shared/components/Section/SectionSpacer';

export type ChallengeExplorerGroupByType = 'hub';

export interface ChallengeExplorerSearchViewProps {
  challenges: SimpleChallengeWithSearchTerms[] | undefined;
  groupBy: ChallengeExplorerGroupByType;
  searchTerms: string[] | undefined;
  loading: boolean;
}

const ChallengeExplorerSearchView: FC<ChallengeExplorerSearchViewProps> = ({
  challenges,
  groupBy,
  searchTerms,
  loading,
}) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useUserContext();
  const getCardLabel = useCallback(
    (roles: string[]) => {
      return isAuthenticated
        ? roles.find(r => r === RoleType.Lead) || roles.find(r => r === RoleType.Member)
        : undefined;
    },
    [isAuthenticated]
  );

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
              <Box key={`boxchallenge_${keyValue}`}>
                <DashboardGenericSection
                  key={`challenge_${keyValue}`}
                  headerText={values[0].hubDisplayName}
                  headerIcon={<HubIcon />}
                  subHeaderText={values[0].hubTagline}
                >
                  <CardsLayoutScroller maxHeight={376} sx={{ marginRight: 0 }}>
                    <CardsLayout items={values}>
                      {challenge => (
                        <SearchChallengeCard
                          name={challenge.displayName}
                          tagline={challenge.tagline}
                          image={challenge.imageUrl}
                          matchedTerms={challenge.matchedTerms}
                          label={getCardLabel(challenge.roles)}
                          url={buildChallengeUrl(challenge.hubNameId, challenge.nameID)}
                          parentName={challenge.hubDisplayName}
                        />
                      )}
                    </CardsLayout>
                  </CardsLayoutScroller>
                </DashboardGenericSection>
                <SectionSpacer key={`spacer_${keyValue}`} />
              </Box>
            ));
          }}
        </GroupBy>
      )}
      {!loading && searchTerms && searchTerms?.length > 0 && !challenges?.length && (
        <Box>{t('pages.challenge-explorer.search.no-results')}</Box>
      )}
      {loading && <Box textAlign="center">{t('common.loading')}</Box>}
    </>
  );
};

export default ChallengeExplorerSearchView;

const getGroupKey = (groupBy: ChallengeExplorerGroupByType): keyof SimpleChallengeWithSearchTerms | undefined => {
  switch (groupBy) {
    case 'hub':
      return 'hubId';
    default:
      return undefined;
  }
};
