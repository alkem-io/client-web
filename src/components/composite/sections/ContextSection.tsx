import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PublicIcon from '@mui/icons-material/Public';
import SchoolIcon from '@mui/icons-material/School';
import { Box, Grid, Link, Typography } from '@mui/material';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactElement } from 'react-markdown';
import { AspectCardFragment, Reference } from '../../../models/graphql-schema';
import { CardLayoutContainer, CardLayoutItem } from '../../core/CardLayoutContainer/CardLayoutContainer';
import Markdown from '../../core/Markdown';
import { SectionSpacer } from '../../core/Section/Section';
import SectionHeader from '../../core/Section/SectionHeader';
import MembershipBackdrop from '../common/Backdrops/MembershipBackdrop';
import AspectCard from '../common/cards/AspectCard/AspectCard';
import DashboardGenericSection from '../common/sections/DashboardGenericSection';
import TagsComponent from '../common/TagsComponent/TagsComponent';
import Button from '@mui/material/Button';
import AspectCreationDialog, { AspectCreationOutput } from '../aspect/AspectCreationDialog/AspectCreationDialog';
import { AspectCardFragmentDoc, useCreateAspectMutation } from '../../../hooks/generated/graphql';
import { useApolloErrorHandler, useNotification, useUrlParams } from '../../../hooks';
import CardFilter from '../../core/card-filter/CardFilter';
import { aspectTagsValueGetter, aspectValueGetter } from '../../core/card-filter/value-getters/aspect-value-getter';

export interface ContextSectionProps {
  contextId?: string;
  primaryAction?: ReactElement;
  banner?: string;
  displayName?: string;
  tagline?: string;
  keywords?: string[];
  vision?: string;
  background?: string;
  impact?: string;
  who?: string;
  references?: Reference[];
  aspects?: AspectCardFragment[];
  aspectsLoading?: boolean;
  canReadAspects?: boolean;
  canCreateAspects?: boolean;
}

const ContextSection: FC<ContextSectionProps> = ({
  contextId,
  primaryAction,
  banner,
  background,
  displayName,
  tagline,
  keywords = [],
  vision,
  impact,
  who,
  references,
  aspects = [],
  aspectsLoading,
  canReadAspects,
  canCreateAspects,
}) => {
  const { t } = useTranslation();
  const handleError = useApolloErrorHandler();
  const notify = useNotification();
  const { ecoverseNameId = '', challengeNameId = '', opportunityNameId = '' } = useUrlParams();
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
          nameID: '',
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
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <DashboardGenericSection
            primaryAction={primaryAction}
            bannerUrl={banner}
            headerText={displayName}
            subHeaderText={<Typography component={Markdown} variant="h5" children={tagline} color="primary" />}
            headerSpacing={'none'}
            options={{ collapsible: { maxHeight: 240 } }}
          >
            <TagsComponent tags={keywords} count={10} />
            <SectionSpacer />
            <SectionHeader text={t('components.contextSegment.vision.title')} />
            <Typography component={Markdown} variant="body1" children={vision} />
          </DashboardGenericSection>
          <SectionSpacer />
          <DashboardGenericSection
            headerText={t('components.contextSegment.background.title')}
            headerSpacing={'none'}
            primaryAction={
              <Box color="grey.main" fontSize={48} display="flex">
                <MenuBookIcon fontSize="inherit" color="inherit" />
              </Box>
            }
            options={{ collapsible: { maxHeight: 192 } }}
          >
            <Typography component={Markdown} variant="body1" children={background} />
          </DashboardGenericSection>
        </Grid>
        <Grid item xs={12} lg={6} zeroMinWidth>
          <DashboardGenericSection
            headerText={t('components.referenceSegment.title')}
            headerSpacing={'none'}
            primaryAction={
              <Box color="grey.main" fontSize={48} display="flex">
                <SchoolIcon fontSize="inherit" color="inherit" />
              </Box>
            }
            options={{ collapsible: { maxHeight: 192 } }}
          >
            {references?.map((l, i) => (
              <Link key={i} href={l.uri} target="_blank">
                <Typography sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {l.name} - {l.description}
                </Typography>
              </Link>
            ))}
          </DashboardGenericSection>
          <SectionSpacer />
          <DashboardGenericSection
            headerText={t('components.contextSegment.impact.title')}
            headerSpacing={'none'}
            primaryAction={
              <Box color="grey.main" fontSize={48} display="flex">
                <PublicIcon fontSize="inherit" color="inherit" />
              </Box>
            }
            options={{ collapsible: { maxHeight: 192 } }}
          >
            <Typography component={Markdown} variant="body1" children={impact} />
          </DashboardGenericSection>
          <SectionSpacer />
          <DashboardGenericSection
            headerText={t('components.contextSegment.who.title')}
            headerSpacing={'none'}
            primaryAction={
              <Box color="grey.main" fontSize={48} display="flex">
                <PeopleAltIcon fontSize="inherit" color="inherit" />
              </Box>
            }
            options={{ collapsible: { maxHeight: 192 } }}
          >
            <Typography component={Markdown} variant="body1" children={who} />
          </DashboardGenericSection>
        </Grid>
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
                            hubNameId={ecoverseNameId}
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
      </Grid>
    </>
  );
};
export default ContextSection;
