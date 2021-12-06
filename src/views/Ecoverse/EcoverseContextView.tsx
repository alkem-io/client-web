import { Link, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import MembershipBackdrop from '../../components/composite/common/Backdrops/MembershipBackdrop';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import TagsComponent from '../../components/composite/common/TagsComponent/TagsComponent';
import ContextLayout from '../../components/composite/layout/Context/ContextLayout';
import ContextSection from '../../components/composite/sections/ContextSection';
import { SectionSpacer } from '../../components/core/Section/Section';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import { EcoverseContainerEntities, EcoverseContainerState } from '../../containers/ecoverse/EcoversePageContainer';
import { Context } from '../../models/graphql-schema';

interface EcoverseContextViewProps {
  entities: EcoverseContainerEntities;
  state: EcoverseContainerState;
}

export const EcoverseContextView: FC<EcoverseContextViewProps> = ({ entities }) => {
  const { t } = useTranslation();
  const { ecoverse, hideChallenges } = entities;
  const { context, displayName, tagset } = ecoverse || {};

  const { tagline = '', impact = '', background = '', vision = '', who = '', references } = context || ({} as Context);
  const ecoverseBanner = ecoverse?.context?.visual?.banner;

  const ecoverseId = ecoverse?.id || '';
  const ecoverseNameId = ecoverse?.nameID || '';

  const rightPanel = (
    <>
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
      <MembershipBackdrop show={hideChallenges} blockName={t('pages.ecoverse.sections.challenges.header')}>
        <ContextSection
          primaryAction={
            <ApplicationButtonContainer
              entities={{
                ecoverseId,
                ecoverseNameId,
                ecoverseName: ecoverse?.displayName || '',
              }}
            >
              {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
            </ApplicationButtonContainer>
          }
          banner={ecoverseBanner}
          background={background}
          displayName={displayName}
          impact={impact}
          tagline={tagline}
          vision={vision}
          who={who}
        />
      </MembershipBackdrop>
    </ContextLayout>
  );
};
export default EcoverseContextView;
