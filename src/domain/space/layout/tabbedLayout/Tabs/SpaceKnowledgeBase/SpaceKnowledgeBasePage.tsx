import { useTranslation } from 'react-i18next';
import PageContent from '@/core/ui/content/PageContent';
import { ContributeCreationBlock } from '@/domain/space/components/ContributeCreationBlock';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import CalloutCreationDialog from '@/domain/collaboration/callout/creationDialog/CalloutCreationDialog';
import { useCalloutCreationWithPreviewImages } from '@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreationWithPreviewImages';
import InfoColumn from '@/core/ui/content/InfoColumn';
import ContentColumn from '@/core/ui/content/ContentColumn';
import CalloutsList from '@/domain/collaboration/callout/calloutsList/CalloutsList';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SpacePageLayout from '@/domain/space/layout/tabbedLayout/layout/SpacePageLayout';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useSpaceTabProvider from '../../SpaceTabProvider';
import Loading from '@/core/ui/loading/Loading';

type KnowledgeBasePageProps = {
  sectionIndex: number;
};

const SpaceKnowledgeBasePage = ({ sectionIndex }: KnowledgeBasePageProps) => {
  const { urlInfo, classificationTagsets, flowStateForNewCallouts, tabDescription } = useSpaceTabProvider({
    tabPosition: sectionIndex,
  });
  const { journeyPath, calloutsSetId } = urlInfo;

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

  const { callouts, canCreateCallout, loading, onCalloutsSortOrderUpdate, refetchCallout } = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
  });

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={{ sectionIndex: sectionIndex }}>
      <>
        <PageContent>
          <InfoColumn>
            <ContributeCreationBlock
              canCreate={canCreateCallout}
              handleCreate={handleCreate}
              tabDescription={tabDescription}
            />
            <PageContentBlock>
              <CalloutsList
                callouts={callouts}
                loading={loading}
                emptyListCaption={t('pages.generic.sections.subEntities.empty-list', {
                  entities: t('common.callouts'),
                })}
              />
            </PageContentBlock>
          </InfoColumn>

          <ContentColumn>
            {loading && <Loading />}
            <CalloutsGroupView
              calloutsSetId={calloutsSetId}
              createInFlowState={flowStateForNewCallouts?.displayName}
              callouts={callouts}
              canCreateCallout={canCreateCallout}
              loading={loading}
              onSortOrderUpdate={onCalloutsSortOrderUpdate}
              onCalloutUpdate={refetchCallout}
            />
          </ContentColumn>
        </PageContent>
        <CalloutCreationDialog
          open={isCalloutCreationDialogOpen}
          onClose={handleCreateCalloutClosed}
          onCreateCallout={handleCreateCallout}
          loading={loadingCalloutCreation}
        />
      </>
    </SpacePageLayout>
  );
};

export default SpaceKnowledgeBasePage;
