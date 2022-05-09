import React, { FC, useState } from 'react';
import MembershipBackdrop from '../../../components/composite/common/Backdrops/MembershipBackdrop';
import DashboardGenericSection from '../../../components/composite/common/sections/DashboardGenericSection';
import Button from '@mui/material/Button';
import CardsLayout, {
  CardLayoutContainer,
  CardLayoutItem,
} from '../../../domain/shared/layout/CardsLayout/CardsLayout';
import AspectCard from '../../../components/composite/common/cards/AspectCard/AspectCard';
import CardFilter from '../../../components/core/card-filter/CardFilter';
import {
  aspectTagsValueGetter,
  aspectValueGetter,
} from '../../../components/core/card-filter/value-getters/aspect-value-getter';
import AspectCreationDialog, {
  AspectCreationDialogProps,
} from '../../../components/composite/aspect/AspectCreationDialog/AspectCreationDialog';
import { Grid } from '@mui/material';
import { useUrlParams } from '../../../hooks';
import { useTranslation } from 'react-i18next';
import { AspectWithPermissions } from '../../../containers/ContributeTabContainer/ContributeTabContainer';

export interface AspectsViewProps {
  aspects?: AspectWithPermissions[];
  aspectsLoading?: boolean;
  canReadAspects?: boolean;
  canCreateAspects?: boolean;
  onCreate: AspectCreationDialogProps['onCreate'];
}

const EMPTY_ASPECTS = []; // re-rendering prevention

const AspectsView: FC<AspectsViewProps> = ({
  aspects = EMPTY_ASPECTS,
  aspectsLoading,
  canReadAspects,
  canCreateAspects,
  onCreate,
}) => {
  const { t } = useTranslation();

  const { hubNameId = '', challengeNameId = '', opportunityNameId = '' } = useUrlParams();
  const [aspectDialogOpen, setAspectDialogOpen] = useState(false);

  const handleCreateDialogOpened = () => setAspectDialogOpen(true);
  const handleCreateDialogClosed = () => setAspectDialogOpen(false);

  return (
    <Grid item xs={12}>
      <MembershipBackdrop show={!canReadAspects} blockName={t('common.aspects')}>
        <DashboardGenericSection
          headerText={`${t('common.aspects')} (${aspects.length})`}
          primaryAction={
            canCreateAspects && (
              <Button variant="contained" onClick={handleCreateDialogOpened}>
                {t('buttons.create')}
              </Button>
            )
          }
        >
          {aspectsLoading ? (
            <CardLayoutContainer>
              <CardLayoutItem>
                <AspectCard loading={true} />
              </CardLayoutItem>
              <CardLayoutItem>
                <AspectCard loading={true} />
              </CardLayoutItem>
            </CardLayoutContainer>
          ) : (
            <CardFilter data={aspects} tagsValueGetter={aspectTagsValueGetter} valueGetter={aspectValueGetter}>
              {filteredAspects =>
                !filteredAspects.length ? (
                  t('pages.contribute.no-aspects')
                ) : (
                  <CardsLayout items={filteredAspects} deps={[hubNameId, challengeNameId, opportunityNameId]}>
                    {aspect => (
                      <AspectCard
                        aspect={aspect}
                        hubNameId={hubNameId}
                        challengeNameId={challengeNameId}
                        opportunityNameId={opportunityNameId}
                      />
                    )}
                  </CardsLayout>
                )
              }
            </CardFilter>
          )}
        </DashboardGenericSection>
      </MembershipBackdrop>
      <AspectCreationDialog
        open={aspectDialogOpen}
        onClose={handleCreateDialogClosed}
        onCreate={onCreate}
        aspectNames={aspects.map(x => x.displayName)}
        hubNameId={hubNameId}
        challengeNameId={challengeNameId}
        opportunityNameId={opportunityNameId}
      />
    </Grid>
  );
};

export default AspectsView;
