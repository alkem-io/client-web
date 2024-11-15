import { useTranslation } from 'react-i18next';
import { CalloutGroupName } from '@/core/apollo/generated/graphql-schema';
import PageContent from '@/core/ui/content/PageContent';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';
import { ContributeCreationBlock } from '../../journey/common/tabs/Contribute/ContributeCreationBlock';
import MembershipBackdrop from '../../shared/components/Backdrops/MembershipBackdrop';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import CalloutsGroupView from '../callout/CalloutsInContext/CalloutsGroupView';
import CalloutCreationDialog from '../callout/creationDialog/CalloutCreationDialog';
import { useCalloutCreationWithPreviewImages } from '../callout/creationDialog/useCalloutCreation/useCalloutCreationWithPreviewImages';
import KnowledgeBaseContainer from './KnowledgeBaseContainer';
import InfoColumn from '@/core/ui/content/InfoColumn';
import ContentColumn from '@/core/ui/content/ContentColumn';
import CalloutsList from '../callout/calloutsList/CalloutsList';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SpacePageLayout from '../../journey/space/layout/SpacePageLayout';

const KnowledgeBasePage = () => {
  const { journeyId, journeyPath } = useRouteResolver();

  const { t } = useTranslation();

  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCreateCallout,
    loading: loadingCalloutCreation,
  } = useCalloutCreationWithPreviewImages({ journeyId });

  const handleCreate = () => {
    handleCreateCalloutOpened();
  };

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={EntityPageSection.KnowledgeBase}>
      <KnowledgeBaseContainer journeyId={journeyId} journeyTypeName="space">
        {({
          callouts: {
            loading,
            canReadCallout,
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
                      emptyListCaption={t('pages.generic.sections.subentities.empty-list', {
                        entities: t('common.callouts'),
                      })}
                    />
                  </PageContentBlock>
                </InfoColumn>

                <ContentColumn>
                  <CalloutsGroupView
                    journeyId={journeyId}
                    callouts={groupedCallouts[CalloutGroupName.Knowledge]}
                    canCreateCallout={canCreateCallout}
                    loading={loading}
                    journeyTypeName="space"
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
              journeyTypeName="space"
            />
          </>
        )}
      </KnowledgeBaseContainer>
    </SpacePageLayout>
  );
};

export default KnowledgeBasePage;
