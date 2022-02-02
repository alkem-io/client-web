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
import { ChallengeContainerEntities, ChallengeContainerState } from '../../containers/challenge/ChallengePageContainer';
import { Context } from '../../models/graphql-schema';
import { getVisualBanner } from '../../utils/visuals.utils';

interface ChallengeContextViewProps {
  entities: ChallengeContainerEntities;
  state: ChallengeContainerState;
}

export const ChallengeContextView: FC<ChallengeContextViewProps> = ({ entities, state }) => {
  const { t } = useTranslation();
  const { challenge, ecoverseId, ecoverseNameId, ecoverseDisplayName } = entities;
  const { context, tagset, displayName } = challenge || {};
  const {
    tagline = '',
    impact = '',
    background = '',
    vision = '',
    who = '',
    references,
    aspects = [],
  } = context || ({} as Context);
  const banner = getVisualBanner(context?.visuals);
  const challengeId = challenge?.id || '';
  const challengeNameId = challenge?.nameID || '';
  const lifecycle = challenge?.lifecycle;

  const rightPanel = (
    <>
      <LifecycleSection lifecycle={lifecycle} />
      <SectionSpacer />
      <DashboardGenericSection headerText={t('components.profile.fields.keywords.title')}>
        <TagsComponent tags={tagset?.tags || []} />
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
              ecoverseId,
              ecoverseNameId,
              ecoverseName: ecoverseDisplayName,
              challengeId,
              challengeName: challenge?.displayName || '',
              challengeNameId,
            }}
          >
            {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
          </ApplicationButtonContainer>
        }
        banner={banner}
        background={background}
        displayName={displayName}
        impact={impact}
        tagline={tagline}
        vision={vision}
        who={who}
        aspects={aspects}
        aspectsLoading={state.loading}
      />
    </ContextLayout>
  );
};
