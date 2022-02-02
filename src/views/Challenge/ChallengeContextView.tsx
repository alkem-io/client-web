import { Link, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import TagsComponent from '../../components/composite/common/TagsComponent/TagsComponent';
import ContextLayout from '../../components/composite/layout/Context/ContextLayout';
import ContextSection from '../../components/composite/sections/ContextSection';
import LifecycleSection from '../../components/composite/sections/LifecycleSection';
import { SectionSpacer } from '../../components/core/Section/Section';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import { Context, ContextTabFragment, LifecycleContextTabFragment, Tagset } from '../../models/graphql-schema';
import { getVisualBanner } from '../../utils/visuals.utils';
import { ApolloError } from '@apollo/client';
import { ViewProps } from '../../models/view';

interface ChallengeContextEntities {
  context?: ContextTabFragment;
  hubId?: string;
  hubNameId?: string;
  hubDisplayName?: string;
  challengeId?: string;
  challengeNameId?: string;
  challengeDisplayName?: string;
  challengeTagset?: Tagset;
  challengeLifecycle?: LifecycleContextTabFragment;
}
interface ChallengeContextActions {}
interface ChallengeContextState {
  loading: boolean;
  error?: ApolloError;
}
interface ChallengeContextOptions {
  canReadAspects: boolean;
}

interface ChallengeContextViewProps
  extends ViewProps<
    ChallengeContextEntities,
    ChallengeContextActions,
    ChallengeContextState,
    ChallengeContextOptions
  > {}

export const ChallengeContextView: FC<ChallengeContextViewProps> = ({ entities, state, options }) => {
  const { t } = useTranslation();
  const { canReadAspects } = options;
  const { loading } = state;
  const {
    context,
    hubId = '',
    hubNameId = '',
    hubDisplayName = '',
    challengeId,
    challengeNameId,
    challengeDisplayName = '',
    challengeTagset,
    challengeLifecycle,
  } = entities;
  const {
    tagline = '',
    impact = '',
    background = '',
    vision = '',
    who = '',
    references,
    aspects = [],
    visuals = [],
  } = context || ({} as Context);
  const banner = getVisualBanner(visuals);

  const rightPanel = (
    <>
      <LifecycleSection lifecycle={challengeLifecycle} />
      <SectionSpacer />
      <DashboardGenericSection headerText={t('components.profile.fields.keywords.title')}>
        <TagsComponent tags={challengeTagset?.tags ?? []} />
      </DashboardGenericSection>
      <SectionSpacer />
      <DashboardGenericSection headerText={t('components.referenceSegment.title')}>
        {references?.map((l, i) => (
          <Link key={i} href={l.uri} target="_blank">
            <Typography>{l.uri}</Typography>
          </Link>
        ))}
      </DashboardGenericSection>
    </>
  );

  return (
    <ContextLayout rightPanel={rightPanel}>
      <ContextSection
        primaryAction={
          <ApplicationButtonContainer
            entities={{
              ecoverseId: hubId,
              ecoverseNameId: hubNameId,
              ecoverseName: hubDisplayName,
              challengeId,
              challengeName: challengeDisplayName,
              challengeNameId,
            }}
          >
            {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
          </ApplicationButtonContainer>
        }
        banner={banner}
        background={background}
        displayName={challengeDisplayName}
        impact={impact}
        tagline={tagline}
        vision={vision}
        who={who}
        aspects={aspects}
        aspectsLoading={loading}
        canReadAspects={canReadAspects}
      />
    </ContextLayout>
  );
};
