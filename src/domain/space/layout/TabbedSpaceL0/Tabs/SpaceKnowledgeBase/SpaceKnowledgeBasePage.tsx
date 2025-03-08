import { useTranslation } from 'react-i18next';
import PageContent from '@/core/ui/content/PageContent';
import { ContributeCreationBlock } from '@/domain/journey/common/tabs/Contribute/ContributeCreationBlock';
import MembershipBackdrop from '@/domain/shared/components/Backdrops/MembershipBackdrop';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import CalloutsGroupView from '../../../../../collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import CalloutCreationDialog from '../../../../../collaboration/callout/creationDialog/CalloutCreationDialog';
import { useCalloutCreationWithPreviewImages } from '../../../../../collaboration/calloutsSet/useCalloutCreation/useCalloutCreationWithPreviewImages';
import InfoColumn from '@/core/ui/content/InfoColumn';
import ContentColumn from '@/core/ui/content/ContentColumn';
import CalloutsList from '../../../../../collaboration/callout/calloutsList/CalloutsList';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SpacePageLayout from '@/domain/journey/space/layout/SpacePageLayout';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useSpaceTabProvider from '../../SpaceTabProvider';

type KnowledgeBasePageProps = {
  calloutsFlowState: EntityPageSection;
};

const SpaceKnowledgeBasePage = ({ calloutsFlowState }: KnowledgeBasePageProps) => {
  const { urlInfo, classificationTagsets, entitledToSaveAsTemplate, flowStateForNewCallouts, canSaveAsTemplate } =
    useSpaceTabProvider({
      tabPosition: 3,
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

  const { callouts, canCreateCallout, onCalloutsSortOrderUpdate, refetchCallout } = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
    canSaveAsTemplate,
    entitledToSaveAsTemplate,
    includeClassification: true,
  });

  const loading = false;

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={calloutsFlowState}>
      <>
        <MembershipBackdrop show={!loading} blockName={t('common.space')}>
          <PageContent>
            <InfoColumn>
              <ContributeCreationBlock canCreate={canCreateCallout} handleCreate={handleCreate} />
              <PageContentBlock>
                <CalloutsList
                  callouts={callouts}
                  emptyListCaption={t('pages.generic.sections.subEntities.empty-list', {
                    entities: t('common.callouts'),
                  })}
                />
              </PageContentBlock>
            </InfoColumn>

            <ContentColumn>
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
        </MembershipBackdrop>
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
