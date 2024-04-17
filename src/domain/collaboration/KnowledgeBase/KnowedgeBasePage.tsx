import { Button } from '@mui/material';
import { PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutGroupName } from '../../../core/apollo/generated/graphql-schema';
import PageContent from '../../../core/ui/content/PageContent';
import { useRouteResolver } from '../../../main/routing/resolvers/RouteResolver';
import { JourneyTypeName } from '../../journey/JourneyTypeName';
import { ContributeCreationBlock } from '../../journey/common/tabs/Contribute/ContributeCreationBlock';
import MembershipBackdrop from '../../shared/components/Backdrops/MembershipBackdrop';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import usePageLayoutByEntity from '../../shared/utils/usePageLayoutByEntity';
import CalloutsGroupView from '../callout/CalloutsInContext/CalloutsGroupView';
import CalloutsListDialog from '../callout/CalloutsListDialog/CalloutsListDialog';
import CalloutCreationDialog from '../callout/creationDialog/CalloutCreationDialog';
import { useCalloutCreationWithPreviewImages } from '../callout/creationDialog/useCalloutCreation/useCalloutCreationWithPreviewImages';
import KnowledgeBaseContainer from './KnowledgeBaseContainer';
import InfoColumn from '../../../core/ui/content/InfoColumn';
import ContentColumn from '../../../core/ui/content/ContentColumn';
import EllipsableWithCount from '../../../core/ui/typography/EllipsableWithCount';

interface KnowledgeBasePageProps {
  journeyTypeName: JourneyTypeName;
}

const KnowledgeBasePage = ({ journeyTypeName }: PropsWithChildren<KnowledgeBasePageProps>) => {
  const PageLayout = usePageLayoutByEntity(journeyTypeName);
  const [isCalloutsListDialogOpen, setCalloutsListDialogOpen] = useState(false);

  const { journeyId, journeyPath } = useRouteResolver();

  const { t } = useTranslation();

  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCreateCallout,
    loading: loadingCalloutCreation,
  } = useCalloutCreationWithPreviewImages();

  const handleCreate = () => {
    handleCreateCalloutOpened();
  };

  return (
    <PageLayout journeyId={journeyId} journeyPath={journeyPath} currentSection={EntityPageSection.KnowledgeBase}>
      <KnowledgeBaseContainer journeyId={journeyId} journeyTypeName={journeyTypeName}>
        {({
          callouts: {
            loading,
            canReadCallout,
            canCreateCallout,
            canCreateCalloutFromTemplate,
            groupedCallouts,
            calloutNames,
            onCalloutsSortOrderUpdate,
            refetchCallout,
          },
        }) => (
          <>
            <MembershipBackdrop show={!loading && !canReadCallout} blockName={t(`common.${journeyTypeName}` as const)}>
              <PageContent>
                <InfoColumn>
                  <ContributeCreationBlock canCreate={canCreateCallout} handleCreate={handleCreate} />
                  <Button onClick={() => setCalloutsListDialogOpen(true)}>Callouts List{/* TODO!! */}</Button>
                  <CalloutsListDialog
                    open={isCalloutsListDialogOpen}
                    onClose={() => setCalloutsListDialogOpen(false)}
                    callouts={groupedCallouts[CalloutGroupName.Knowledge]}
                    renderCallout={callout => (
                      <EllipsableWithCount count={callout.activity}>
                        {callout.framing.profile.displayName}
                      </EllipsableWithCount>
                    )}
                    emptyListCaption={t('pages.generic.sections.subentities.empty-list', {
                      entities: t('common.callouts'),
                    })}
                  />
                </InfoColumn>

                <ContentColumn>
                  <CalloutsGroupView
                    callouts={groupedCallouts[CalloutGroupName.Knowledge]}
                    canCreateCallout={canCreateCallout}
                    canCreateCalloutFromTemplate={canCreateCalloutFromTemplate}
                    loading={loading}
                    journeyTypeName={journeyTypeName}
                    calloutNames={calloutNames}
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
              canCreateCalloutFromTemplate={canCreateCalloutFromTemplate}
              loading={loadingCalloutCreation}
              calloutNames={calloutNames}
              groupName={CalloutGroupName.Knowledge}
              journeyTypeName={journeyTypeName}
            />
          </>
        )}
      </KnowledgeBaseContainer>
    </PageLayout>
  );
};

export default KnowledgeBasePage;
