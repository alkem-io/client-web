import { useTranslation } from 'react-i18next';
import PageContent from '@/core/ui/content/PageContent';
import { ContributeCreationBlock } from '@/domain/journey/common/tabs/Contribute/ContributeCreationBlock';
import MembershipBackdrop from '@/domain/shared/components/Backdrops/MembershipBackdrop';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import CalloutsGroupView from '../calloutsSet/CalloutsInContext/CalloutsGroupView';
import CalloutCreationDialog from '../callout/creationDialog/CalloutCreationDialog';
import { useCalloutCreationWithPreviewImages } from '../calloutsSet/useCalloutCreation/useCalloutCreationWithPreviewImages';
import KnowledgeBaseContainer from './KnowledgeBaseContainer';
import InfoColumn from '@/core/ui/content/InfoColumn';
import ContentColumn from '@/core/ui/content/ContentColumn';
import CalloutsList from '../callout/calloutsList/CalloutsList';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SpacePageLayout from '@/domain/journey/space/layout/SpacePageLayout';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

type KnowledgeBasePageProps = {
  calloutsFlowState: EntityPageSection;
};

const KnowledgeBasePage = ({ calloutsFlowState }: KnowledgeBasePageProps) => {
  const { journeyPath, collaborationId, calloutsSetId } = useUrlResolver();

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

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={calloutsFlowState}>
      <KnowledgeBaseContainer collaborationId={collaborationId}>
        {({
          callouts: {
            loading,
            canReadCalloutsSet: canReadCallout,
            canCreateCallout,
            callouts: allCallouts,
            // groupedCallouts,
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
                      // callouts={groupedCallouts[CalloutGroupName.Knowledge]}
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
                    // callouts={groupedCallouts[CalloutGroupName.Knowledge]}
                    callouts={allCallouts}
                    canCreateCallout={canCreateCallout}
                    loading={loading}
                    onSortOrderUpdate={onCalloutsSortOrderUpdate}
                    onCalloutUpdate={refetchCallout}
                    groupName={CalloutGroupName.Knowledge}
                  />
                </ContentColumn>
              </PageContent>
            </MembershipBackdrop>
            <CalloutCreationDialog
              open={isCalloutCreationDialogOpen}
              onClose={handleCreateCalloutClosed}
              onCreateCallout={handleCreateCallout}
              loading={loadingCalloutCreation}
              groupName={CalloutGroupName.Knowledge}
            />
          </>
        )}
      </KnowledgeBaseContainer>
    </SpacePageLayout>
  );
};

export default KnowledgeBasePage;
