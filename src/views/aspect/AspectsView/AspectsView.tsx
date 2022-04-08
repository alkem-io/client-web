import React, { FC, useState } from 'react';
import MembershipBackdrop from '../../../components/composite/common/Backdrops/MembershipBackdrop';
import DashboardGenericSection from '../../../components/composite/common/sections/DashboardGenericSection';
import Button from '@mui/material/Button';
import { CardLayoutContainer, CardLayoutItem } from '../../../components/core/CardLayoutContainer/CardLayoutContainer';
import AspectCard from '../../../components/composite/common/cards/AspectCard/AspectCard';
import CardFilter from '../../../components/core/card-filter/CardFilter';
import {
  aspectTagsValueGetter,
  aspectValueGetter,
} from '../../../components/core/card-filter/value-getters/aspect-value-getter';
import AspectCreationDialog, {
  AspectCreationOutput,
} from '../../../components/composite/aspect/AspectCreationDialog/AspectCreationDialog';
import { Grid } from '@mui/material';
import { useApolloErrorHandler, useNotification, useUrlParams } from '../../../hooks';
import { AspectCardFragmentDoc, useCreateAspectMutation } from '../../../hooks/generated/graphql';
import { useTranslation } from 'react-i18next';
import { AspectCardFragment } from '../../../models/graphql-schema';

interface AspectsViewProps {
  aspects?: AspectCardFragment[];
  contextId?: string;
  aspectsLoading?: boolean;
  canReadAspects?: boolean;
  canCreateAspects?: boolean;
}

const EMPTY_ASPECTS = []; // re-rendering prevention

const AspectsView: FC<AspectsViewProps> = ({
  aspects = EMPTY_ASPECTS,
  contextId,
  aspectsLoading,
  canReadAspects,
  canCreateAspects,
}) => {
  const { t } = useTranslation();
  const handleError = useApolloErrorHandler();
  const notify = useNotification();

  const { hubNameId = '', challengeNameId = '', opportunityNameId = '' } = useUrlParams();
  const [aspectDialogOpen, setAspectDialogOpen] = useState(false);

  // todo: move handlers to the contextTabContainer
  const [createAspect] = useCreateAspectMutation({
    onError: handleError,
    onCompleted: () => notify(t('components.context-section.create-aspect'), 'success'),
    update: (cache, { data }) => {
      if (!data) {
        return;
      }
      const { createAspectOnContext } = data;

      const contextRefId = cache.identify({
        __typename: 'Context',
        id: contextId,
      });

      if (!contextRefId) {
        return;
      }

      cache.modify({
        id: contextRefId,
        fields: {
          aspects(existingAspects = []) {
            const newAspectRef = cache.writeFragment({
              data: createAspectOnContext,
              fragment: AspectCardFragmentDoc,
              fragmentName: 'AspectCard',
            });
            return [...existingAspects, newAspectRef];
          },
        },
      });
    },
  });

  const handleCreateDialogOpened = () => setAspectDialogOpen(true);
  const handleCreateDialogClosed = () => setAspectDialogOpen(false);
  const onCreate = async (aspect: AspectCreationOutput) => {
    if (!contextId) {
      return;
    }

    createAspect({
      variables: {
        aspectData: {
          contextID: contextId,
          displayName: aspect.displayName,
          description: aspect.description,
          type: aspect.type,
          tags: aspect.tags,
        },
      },
      optimisticResponse: {
        createAspectOnContext: {
          __typename: 'Aspect',
          id: '',
          nameID: aspect.nameID || '',
          displayName: aspect.displayName ?? '',
          description: aspect.description,
          type: aspect.type,
          tagset: {
            id: '-1',
            name: 'default',
            tags: aspect.tags ?? [],
          },
          banner: {
            id: '-1',
            name: '',
            uri: '',
          },
          bannerNarrow: {
            id: '-1',
            name: '',
            uri: '',
          },
        },
      },
    });

    setAspectDialogOpen(false);
  };

  return (
    <Grid item xs={12}>
      <MembershipBackdrop show={!canReadAspects} blockName={t('common.aspects')}>
        <DashboardGenericSection
          headerText={`${t('common.aspects')} (${aspects ? aspects.length : 0})`}
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
              {filteredAspects => (
                <CardLayoutContainer>
                  {filteredAspects.map((x, i) => (
                    <CardLayoutItem key={i}>
                      <AspectCard
                        aspect={x}
                        hubNameId={hubNameId}
                        challengeNameId={challengeNameId}
                        opportunityNameId={opportunityNameId}
                      />
                    </CardLayoutItem>
                  ))}
                </CardLayoutContainer>
              )}
            </CardFilter>
          )}
        </DashboardGenericSection>
      </MembershipBackdrop>
      <AspectCreationDialog
        open={aspectDialogOpen}
        onCancel={handleCreateDialogClosed}
        onCreate={onCreate}
        aspectNames={aspects.map(x => x.displayName)}
      />
    </Grid>
  );
};

export default AspectsView;
