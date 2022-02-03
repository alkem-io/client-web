import { Typography } from '@mui/material';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactElement } from 'react-markdown';
import Markdown from '../../core/Markdown';
import { SectionSpacer } from '../../core/Section/Section';
import SectionHeader from '../../core/Section/SectionHeader';
import DashboardGenericSection from '../common/sections/DashboardGenericSection';
import { AspectCardFragment } from '../../../models/graphql-schema';
import { CardLayoutContainer, CardLayoutItem } from '../../core/CardLayoutContainer/CardLayoutContainer';
import AspectCard from '../common/cards/AspectCard/AspectCard';
import MembershipBackdrop from '../common/Backdrops/MembershipBackdrop';
import Button from '@mui/material/Button';
import AspectCreationDialog from '../aspect/AspectCreationDialog/AspectCreationDialog';

export interface ContextSectionProps {
  primaryAction?: ReactElement;
  banner?: string;
  displayName?: string;
  tagline?: string;
  vision?: string;
  background?: string;
  impact?: string;
  who?: string;
  aspects: AspectCardFragment[];
  aspectsLoading?: boolean;
  canReadAspects?: boolean;
}

const ContextSection: FC<ContextSectionProps> = ({
  primaryAction,
  banner,
  background,
  displayName,
  tagline,
  vision,
  impact,
  who,
  aspects = [],
  aspectsLoading,
  canReadAspects,
}) => {
  const { t } = useTranslation();
  const [aspectDialogOpen, setAspectDialogOpen] = useState(false);

  const onCreateAspectClicked = () => setAspectDialogOpen(true);
  const onCreateAspectDialogClosed = () => setAspectDialogOpen(false);

  return (
    <>
      <DashboardGenericSection primaryAction={primaryAction} bannerUrl={banner} headerText={displayName}>
        <Typography component={Markdown} variant="body1" children={tagline} />
        <SectionHeader text={t('components.contextSegment.vision.title')} />
        <Typography component={Markdown} variant="body1" children={vision} />
      </DashboardGenericSection>
      <SectionSpacer />
      <DashboardGenericSection headerText={t('components.contextSegment.background.title')}>
        <Typography component={Markdown} variant="body1" children={background} />
      </DashboardGenericSection>
      <SectionSpacer />
      <DashboardGenericSection headerText={t('components.contextSegment.impact.title')}>
        <Typography component={Markdown} variant="body1" children={impact} />
      </DashboardGenericSection>
      <SectionSpacer />
      <DashboardGenericSection headerText={t('components.contextSegment.who.title')}>
        <Typography component={Markdown} variant="body1" children={who} />
      </DashboardGenericSection>
      <SectionSpacer />
      <MembershipBackdrop show={!canReadAspects} blockName={t('common.aspects')}>
        <DashboardGenericSection
          headerText={`${t('common.aspects')} (${aspects.length})`}
          primaryAction={<Button onClick={onCreateAspectClicked}>Create</Button>}
        >
          <CardLayoutContainer>
            {aspectsLoading ? (
              <>
                <CardLayoutItem>
                  <AspectCard loading={true} />
                </CardLayoutItem>
                <CardLayoutItem>
                  <AspectCard loading={true} />
                </CardLayoutItem>
              </>
            ) : (
              <>
                {aspects.map((x, i) => (
                  <CardLayoutItem key={i}>
                    <AspectCard aspect={x} challengeNameId={''} ecoverseNameId={''} />
                  </CardLayoutItem>
                ))}
              </>
            )}
          </CardLayoutContainer>
        </DashboardGenericSection>
      </MembershipBackdrop>
      <AspectCreationDialog open={aspectDialogOpen} onCancel={onCreateAspectDialogClosed} />
    </>
  );
};
export default ContextSection;
