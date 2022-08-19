import React, { FC, useState } from 'react';
import MembershipBackdrop from '../../../components/composite/common/Backdrops/MembershipBackdrop';
import DashboardGenericSection from '../../../domain/shared/components/DashboardSections/DashboardGenericSection';
import Button from '@mui/material/Button';
import CardsLayout from '../../../domain/shared/layout/CardsLayout/CardsLayout';
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
  aspects: AspectWithPermissions[] | undefined;
  aspectsLoading?: boolean;
  canReadAspects?: boolean;
  canCreateAspects?: boolean;
  onCreate: AspectCreationDialogProps['onCreate'];
}

const EMPTY_ASPECTS: AspectWithPermissions[] = []; // re-rendering prevention

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
          <CardFilter data={aspects} tagsValueGetter={aspectTagsValueGetter} valueGetter={aspectValueGetter}>
            {filteredAspects =>
              !aspectsLoading && !filteredAspects.length ? (
                t('pages.contribute.no-aspects')
              ) : (
                <CardsLayout
                  items={aspectsLoading ? [undefined, undefined] : filteredAspects}
                  deps={[hubNameId, challengeNameId, opportunityNameId]}
                >
                  {aspect => (
                    <AspectCard
                      aspect={aspect}
                      hubNameId={hubNameId}
                      challengeNameId={challengeNameId}
                      opportunityNameId={opportunityNameId}
                      loading={!aspect}
                      keepScroll
                    />
                  )}
                </CardsLayout>
              )
            }
          </CardFilter>
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
