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
import { Context, OpportunityPageFragment, Reference } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';

export interface OpportunityContextViewEntities {
  opportunity: OpportunityPageFragment;
  meme?: Reference;
}

export interface OpportunityContextViewActions {
  onMemeError: () => void;
}

export interface OpportunityContextViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface OpportunityContextViewOptions {}

export interface OpportunityContextViewProps
  extends ViewProps<
    OpportunityContextViewEntities,
    OpportunityContextViewActions,
    OpportunityContextViewState,
    OpportunityContextViewOptions
  > {}

const OpportunityContextView: FC<OpportunityContextViewProps> = ({ entities }) => {
  const { t } = useTranslation();

  const opportunity = entities.opportunity;
  const { context, displayName, tagset } = opportunity;

  const { tagline = '', impact = '', background = '', vision = '', who = '', references } = context || ({} as Context);
  const banner = context?.visual?.banner;
  const lifecycle = opportunity?.lifecycle;

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
        banner={banner}
        background={background}
        displayName={displayName}
        impact={impact}
        tagline={tagline}
        vision={vision}
        who={who}
      />
      <SectionSpacer />
    </ContextLayout>
  );
};
export default OpportunityContextView;
