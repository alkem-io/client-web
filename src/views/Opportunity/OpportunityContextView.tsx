import { ApolloError } from '@apollo/client';
import { Link, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import TagsComponent from '../../components/composite/common/TagsComponent/TagsComponent';
import ContextLayout from '../../components/composite/layout/Context/ContextLayout';
import ContextSection from '../../components/composite/sections/ContextSection';
import LifecycleSection from '../../components/composite/sections/LifecycleSection';
import { SectionSpacer } from '../../components/core/Section/Section';
import { Context, ContextTabFragment, LifecycleContextTabFragment, Tagset } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import { getVisualBanner } from '../../utils/visuals.utils';

export interface OpportunityContextViewEntities {
  context?: ContextTabFragment;
  opportunityDisplayName?: string;
  opportunityTagset?: Tagset;
  opportunityLifecycle?: LifecycleContextTabFragment;
}

export interface OpportunityContextViewActions {}

export interface OpportunityContextViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface OpportunityContextViewOptions {
  canReadAspects: boolean;
}

export interface OpportunityContextViewProps
  extends ViewProps<
    OpportunityContextViewEntities,
    OpportunityContextViewActions,
    OpportunityContextViewState,
    OpportunityContextViewOptions
  > {}

const OpportunityContextView: FC<OpportunityContextViewProps> = ({ entities, options, state }) => {
  const { t } = useTranslation();
  const { canReadAspects } = options;
  const { loading } = state;
  const { context, opportunityDisplayName, opportunityTagset, opportunityLifecycle } = entities;

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
      <LifecycleSection lifecycle={opportunityLifecycle} />
      <SectionSpacer />
      <DashboardGenericSection headerText={t('components.profile.fields.keywords.title')}>
        <TagsComponent tags={opportunityTagset?.tags ?? []} />
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
        banner={banner}
        background={background}
        displayName={opportunityDisplayName}
        impact={impact}
        tagline={tagline}
        vision={vision}
        who={who}
        aspects={aspects}
        aspectsLoading={loading}
        canReadAspects={canReadAspects}
      />
      <SectionSpacer />
    </ContextLayout>
  );
};
export default OpportunityContextView;
