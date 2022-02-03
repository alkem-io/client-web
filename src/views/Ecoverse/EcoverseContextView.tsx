import { Link, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import TagsComponent from '../../components/composite/common/TagsComponent/TagsComponent';
import ContextLayout from '../../components/composite/layout/Context/ContextLayout';
import ContextSection from '../../components/composite/sections/ContextSection';
import { SectionSpacer } from '../../components/core/Section/Section';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import { Context, ContextTabFragment, Tagset } from '../../models/graphql-schema';
import { getVisualBanner } from '../../utils/visuals.utils';
import { ViewProps } from '../../models/view';
import { ApolloError } from '@apollo/client';

interface EcoverseContextEntities {
  context?: ContextTabFragment;
  hubId?: string;
  hubNameId?: string;
  hubDisplayName?: string;
  hubTagSet?: Tagset;
}
interface EcoverseContextActions {}
interface EcoverseContextState {
  loading: boolean;
  error?: ApolloError;
}
interface EcoverseContextOptions {
  canReadAspects: boolean;
}

interface EcoverseContextViewProps
  extends ViewProps<EcoverseContextEntities, EcoverseContextActions, EcoverseContextState, EcoverseContextOptions> {}

export const EcoverseContextView: FC<EcoverseContextViewProps> = ({ entities, state, options }) => {
  const { t } = useTranslation();
  const { canReadAspects } = options;
  const { loading } = state;
  const { context, hubId, hubNameId, hubDisplayName, hubTagSet } = entities;

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
  const ecoverseBanner = getVisualBanner(visuals);

  const rightPanel = (
    <>
      <DashboardGenericSection headerText={t('components.profile.fields.keywords.title')}>
        <TagsComponent tags={hubTagSet?.tags ?? []} />
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
          hubId && hubNameId && hubDisplayName ? (
            <ApplicationButtonContainer
              entities={{
                ecoverseId: hubId,
                ecoverseNameId: hubNameId,
                ecoverseName: hubDisplayName,
              }}
            >
              {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
            </ApplicationButtonContainer>
          ) : undefined
        }
        banner={ecoverseBanner}
        background={background}
        displayName={hubDisplayName}
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
export default EcoverseContextView;
