import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChallengeCard from '../../../../common/components/composite/common/cards/ChallengeCard/ChallengeCard';
import CardFilter from '../../../../common/components/core/card-filter/CardFilter';
import {
  entityTagsValueGetter,
  entityValueGetter,
} from '../../../../common/components/core/card-filter/value-getters/entity-value-getter';
import ErrorBlock from '../../../../common/components/core/ErrorBlock';
import { ChallengeIcon } from '../../../shared/icons/ChallengeIcon';
import { buildChallengeUrl } from '../../../../common/utils/urlBuilders';
import { Challenge, ChallengeCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import { ViewProps } from '../../../../core/container/view';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import LinksList from '../../../../core/ui/list/LinksList';
import MembershipBackdrop from '../../../shared/components/Backdrops/MembershipBackdrop';
import CardsLayout from '../../../shared/layout/CardsLayout/CardsLayout';

interface Permissions {
  canReadChallenges: boolean;
}

interface HubChallengesViewEntities {
  challenges: ChallengeCardFragment[];
  hubNameId: string;
  permissions: Permissions;
}

export interface HubChallengesViewActions {}

export interface HubChallengesViewOptions {}

export interface HubChallengesViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface HubChallengesViewProps
  extends ViewProps<
    HubChallengesViewEntities,
    HubChallengesViewActions,
    HubChallengesViewState,
    HubChallengesViewOptions
  > {}

const HubChallengesView: FC<HubChallengesViewProps> = ({ entities, state }) => {
  const { t } = useTranslation();
  const { challenges, permissions, hubNameId } = entities;
  const { canReadChallenges } = permissions;

  return (
    <MembershipBackdrop show={!canReadChallenges} blockName={t('pages.hub.sections.challenges.header')}>
      <PageContent>
        <PageContentColumn columns={4}>
          <PageContentBlock>
            <PageContentBlockHeader
              title={t('pages.generic.sections.subentities.list', { entities: t('common.challenges') })}
            />
            <LinksList
              items={entities.challenges.map(challenge => ({
                id: challenge.id,
                title: challenge.displayName,
                url: buildChallengeUrl(hubNameId, challenge.nameID),
                icon: <ChallengeIcon />,
              }))}
            />
          </PageContentBlock>
        </PageContentColumn>

        <PageContentColumn columns={8}>
          {state.error && <ErrorBlock blockName={t('pages.hub.sections.challenges.header')} />}
          {!state.loading && !challenges.length ? (
            <Box paddingBottom={2} display="flex" justifyContent="center">
              <Typography>{t('pages.hub.sections.challenges.no-data')}</Typography>
            </Box>
          ) : (
            <CardFilter
              data={challenges as Challenge[] /* TODO remove type casting */}
              tagsValueGetter={entityTagsValueGetter}
              valueGetter={entityValueGetter}
            >
              {filteredData => (
                <CardsLayout items={state.loading ? [undefined, undefined] : filteredData} deps={[hubNameId]}>
                  {challenge => <ChallengeCard challenge={challenge} hubNameId={hubNameId} loading={!challenge} />}
                </CardsLayout>
              )}
            </CardFilter>
          )}
        </PageContentColumn>
      </PageContent>
    </MembershipBackdrop>
  );
};
export default HubChallengesView;
