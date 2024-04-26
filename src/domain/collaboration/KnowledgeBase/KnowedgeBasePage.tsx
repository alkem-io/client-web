import { PropsWithChildren } from 'react';
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
import CalloutCreationDialog from '../callout/creationDialog/CalloutCreationDialog';
import { useCalloutCreationWithPreviewImages } from '../callout/creationDialog/useCalloutCreation/useCalloutCreationWithPreviewImages';
import KnowledgeBaseContainer from './KnowledgeBaseContainer';
import InfoColumn from '../../../core/ui/content/InfoColumn';
import ContentColumn from '../../../core/ui/content/ContentColumn';
import CalloutsList from '../callout/calloutsList/CalloutsList';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';

interface KnowledgeBasePageProps {
  journeyTypeName: JourneyTypeName;
}

const KnowledgeBasePage = ({ journeyTypeName }: PropsWithChildren<KnowledgeBasePageProps>) => {
  const PageLayout = usePageLayoutByEntity(journeyTypeName);

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
