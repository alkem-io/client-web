import { useTranslation } from 'react-i18next';
import PageContent from '@/core/ui/content/PageContent';
import { ContributeCreationBlock } from '@/domain/journey/common/tabs/Contribute/ContributeCreationBlock';
import MembershipBackdrop from '@/domain/shared/components/Backdrops/MembershipBackdrop';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import CalloutsGroupView from '../../../collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import CalloutCreationDialog from '../../../collaboration/callout/creationDialog/CalloutCreationDialog';
import { useCalloutCreationWithPreviewImages } from '../../../collaboration/calloutsSet/useCalloutCreation/useCalloutCreationWithPreviewImages';
import KnowledgeBaseContainer from './SpaceKnowledgeBaseContainer';
import InfoColumn from '@/core/ui/content/InfoColumn';
import ContentColumn from '@/core/ui/content/ContentColumn';
import CalloutsList from '../../../collaboration/callout/calloutsList/CalloutsList';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SpacePageLayout from '@/domain/journey/space/layout/SpacePageLayout';
import { SpaceTab } from '@/domain/space/layout/TabbedSpaceL0/SpaceTabs';
import { CalloutsFilterModel } from '../../../collaboration/calloutsSet/CalloutsFilter.model';
import useSpaceTabProvider from '@/domain/space/layout/TabbedSpaceL0/SpaceTab';

type KnowledgeBasePageProps = {
  calloutsFlowState: EntityPageSection;
};

const SpaceKnowledgeBasePage = ({ calloutsFlowState }: KnowledgeBasePageProps) => {
  const { urlInfo, flowStateForTab } = useSpaceTabProvider({ tabPosition: 3 });
  const { journeyPath, collaborationId, calloutsSetId } = urlInfo;

  const { t } = useTranslation();

  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCreateCallout,
    loading: loadingCalloutCreation,
  } = useCalloutCreationWithPreviewImages({ calloutsSetId });

  const handleCreate = () => {
    handleCreateCalloutOpened();
  };

  const calloutsFilter: CalloutsFilterModel = {
    flowState: flowStateForTab?.displayName,
  };

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={calloutsFlowState}>
      <KnowledgeBaseContainer collaborationId={collaborationId}>
        {({
          callouts: {
            loading,
            canReadCalloutsSet: canReadCallout,
            canCreateCallout,
            callouts: allCallouts,
            onCalloutsSortOrderUpdate,
            refetchCallout,
          },
        }) => (
          <>
            <MembershipBackdrop show={!loading && !canReadCallout} blockName={t('common.space')}>
              <PageContent>
                <InfoColumn>
                  <ContributeCreationBlock canCreate={canCreateCallout} handleCreate={handleCreate} />
                  <PageContentBlock>
                    <CalloutsList
                      // callouts={groupedCallouts[SpaceTab.KNOWLEDGE]}
                      callouts={allCallouts}
                      emptyListCaption={t('pages.generic.sections.subEntities.empty-list', {
                        entities: t('common.callouts'),
                      })}
                    />
                  </PageContentBlock>
                </InfoColumn>

                <ContentColumn>
                  <CalloutsGroupView
                    calloutsSetId={calloutsSetId}
                    createInFlowState={SpaceTab.KNOWLEDGE}
                    callouts={allCallouts}
                    canCreateCallout={canCreateCallout}
                    loading={loading}
                    onSortOrderUpdate={onCalloutsSortOrderUpdate}
                    onCalloutUpdate={refetchCallout}
                    calloutsFilter={calloutsFilter}
                  />
                </ContentColumn>
              </PageContent>
            </MembershipBackdrop>
            <CalloutCreationDialog
              open={isCalloutCreationDialogOpen}
              onClose={handleCreateCalloutClosed}
              onCreateCallout={handleCreateCallout}
              loading={loadingCalloutCreation}
            />
          </>
        )}
      </KnowledgeBaseContainer>
    </SpacePageLayout>
  );
};

export default SpaceKnowledgeBasePage;
