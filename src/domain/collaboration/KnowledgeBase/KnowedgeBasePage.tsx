import React, { PropsWithChildren } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material';
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
import { TypedCallout } from '../callout/useCallouts/useCallouts';
import { useTranslation } from 'react-i18next';
import EllipsableWithCount from '../../../core/ui/typography/EllipsableWithCount';
import { useCalloutCreationWithPreviewImages } from '../callout/creationDialog/useCalloutCreation/useCalloutCreationWithPreviewImages';
import { CalloutGroupName } from '../../../core/apollo/generated/graphql-schema';
import calloutIcons from '../callout/utils/calloutIcons';
import CalloutsGroupView from '../callout/CalloutsInContext/CalloutsGroupView';
import CalloutCreationDialog from '../callout/creationDialog/CalloutCreationDialog';
import KnowledgeBaseContainer from './KnowledgeBaseContainer';
import { useRouteResolver } from '../../../main/routing/resolvers/RouteResolver';
import { CONTENT_COLUMNS, SIDEBAR_COLUMNS, COLUMNS_MOBILE } from '../../../core/ui/themes/default/Theme';

interface KnowledgeBasePageProps {
  journeyTypeName: JourneyTypeName;
}

const KnowledgeBasePage = ({ journeyTypeName }: PropsWithChildren<KnowledgeBasePageProps>) => {
  const PageLayout = usePageLayoutByEntity(journeyTypeName);

  const { journeyId } = useRouteResolver();

  const { t } = useTranslation();

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

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
                <PageContentColumn columns={isMobile ? COLUMNS_MOBILE : SIDEBAR_COLUMNS}>
                  <ContributeCreationBlock canCreate={canCreateCallout} handleCreate={handleCreate} />
                  <PageContentBlock>
                    <PageContentBlockHeader
                      title={t('pages.generic.sections.subentities.list', { entities: t('common.callouts') })}
                    />
                    <LinksList
                      items={groupedCallouts[CalloutGroupName.Knowledge]?.map(callout => {
                        const CalloutIcon = calloutIcons[callout.type];
                        return {
                          id: callout.id,
                          title: buildCalloutTitle(callout),
                          icon: <CalloutIcon />,
                          uri: callout.framing.profile.url,
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

                <PageContentColumn columns={isMobile ? COLUMNS_MOBILE : CONTENT_COLUMNS}>
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
