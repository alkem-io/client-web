import React, { PropsWithChildren } from 'react';
import usePageLayoutByEntity from '../../shared/utils/usePageLayoutByEntity';
import { JourneyTypeName } from '../../journey/JourneyTypeName';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import MembershipBackdrop from '../../shared/components/Backdrops/MembershipBackdrop';
import PageContent from '../../../core/ui/content/PageContent';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import { ContributeCreationBlock } from '../../journey/common/tabs/Contribute/ContributeCreationBlock';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../core/ui/content/PageContentBlockHeader';
import LinksList from '../../../core/ui/list/LinksList';
import { buildCalloutUrl } from '../../../main/routing/urlBuilders';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import { TypedCallout } from '../callout/useCallouts/useCallouts';
import { useTranslation } from 'react-i18next';
import EllipsableWithCount from '../../../core/ui/typography/EllipsableWithCount';
import { useCalloutCreationWithPreviewImages } from '../callout/creationDialog/useCalloutCreation/useCalloutCreationWithPreviewImages';
import { CalloutDisplayLocation } from '../../../core/apollo/generated/graphql-schema';
import calloutIcons from '../callout/utils/calloutIcons';
import CalloutsGroupView from '../callout/CalloutsInContext/CalloutsGroupView';
import CalloutCreationDialog from '../callout/creationDialog/CalloutCreationDialog';
import KnowledgeBaseContainer from './KnowledgeBaseContainer';

interface KnowledgeBasePageProps {
  journeyTypeName: JourneyTypeName;
  scrollToCallout?: boolean;
}

const KnowledgeBasePage = ({ journeyTypeName, scrollToCallout = false }: PropsWithChildren<KnowledgeBasePageProps>) => {
  const PageLayout = usePageLayoutByEntity(journeyTypeName);
  const { spaceNameId, challengeNameId, opportunityNameId } = useUrlParams();

  if (!spaceNameId) {
    throw new Error('Must be within a Space');
  }

  const { t } = useTranslation();

  const buildCalloutTitle = (callout: TypedCallout) => {
    return <EllipsableWithCount count={callout.activity}>{callout.framing.profile.displayName}</EllipsableWithCount>;
  };

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
    <PageLayout currentSection={EntityPageSection.KnowledgeBase}>
      <KnowledgeBaseContainer
        spaceNameId={spaceNameId}
        challengeNameId={challengeNameId}
        opportunityNameId={opportunityNameId}
      >
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
                <PageContentColumn columns={4}>
                  <ContributeCreationBlock canCreate={canCreateCallout} handleCreate={handleCreate} />
                  <PageContentBlock>
                    <PageContentBlockHeader
                      title={t('pages.generic.sections.subentities.list', { entities: t('common.callouts') })}
                    />
                    <LinksList
                      items={groupedCallouts[CalloutDisplayLocation.Knowledge]?.map(callout => {
                        const CalloutIcon = calloutIcons[callout.type];
                        return {
                          id: callout.id,
                          title: buildCalloutTitle(callout),
                          icon: <CalloutIcon />,
                          uri: buildCalloutUrl(callout.nameID, {
                            spaceNameId,
                            challengeNameId,
                            opportunityNameId,
                          }),
                        };
                      })}
                      emptyListCaption={t('pages.generic.sections.subentities.empty-list', {
                        entities: t('common.callouts'),
                        parentEntity: t(`common.${journeyTypeName}` as const),
                      })}
                      loading={loading}
                    />
                  </PageContentBlock>
                </PageContentColumn>

                <PageContentColumn columns={8}>
                  <CalloutsGroupView
                    callouts={groupedCallouts[CalloutDisplayLocation.Knowledge]}
                    spaceId={spaceNameId!}
                    canCreateCallout={canCreateCallout}
                    canCreateCalloutFromTemplate={canCreateCalloutFromTemplate}
                    loading={loading}
                    journeyTypeName={journeyTypeName}
                    calloutNames={calloutNames}
                    onSortOrderUpdate={onCalloutsSortOrderUpdate}
                    onCalloutUpdate={refetchCallout}
                    scrollToCallout={scrollToCallout}
                    displayLocation={CalloutDisplayLocation.Knowledge}
                  />
                </PageContentColumn>
              </PageContent>
            </MembershipBackdrop>
            <CalloutCreationDialog
              open={isCalloutCreationDialogOpen}
              onClose={handleCreateCalloutClosed}
              onCreateCallout={handleCreateCallout}
              canCreateCalloutFromTemplate={canCreateCalloutFromTemplate}
              loading={loadingCalloutCreation}
              calloutNames={calloutNames}
              displayLocation={CalloutDisplayLocation.Knowledge}
              journeyTypeName={journeyTypeName}
            />
          </>
        )}
      </KnowledgeBaseContainer>
    </PageLayout>
  );
};

export default KnowledgeBasePage;
