import { useTranslation } from 'react-i18next';
import { CalloutGroupName } from '@/core/apollo/generated/graphql-schema';
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
import useAboutRedirect from '@/core/routing/useAboutRedirect';

const KnowledgeBasePage = () => {
  const { spaceId, journeyPath, collaborationId, calloutsSetId, loading } = useUrlResolver();

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

  useAboutRedirect({ spaceId, currentSection: EntityPageSection.KnowledgeBase, skip: loading || !spaceId });

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={EntityPageSection.KnowledgeBase}>
      <KnowledgeBaseContainer collaborationId={collaborationId}>
        {({
          callouts: {
            loading,
            canReadCalloutsSet: canReadCallout,
            canCreateCallout,
            groupedCallouts,
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
                      callouts={groupedCallouts[CalloutGroupName.Knowledge]}
                      emptyListCaption={t('pages.generic.sections.subEntities.empty-list', {
                        entities: t('common.callouts'),
                      })}
                    />
                  </PageContentBlock>
                </InfoColumn>

                <ContentColumn>
                  <CalloutsGroupView
                    calloutsSetId={calloutsSetId}
                    callouts={groupedCallouts[CalloutGroupName.Knowledge]}
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
