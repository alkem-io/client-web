import { useState, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import PageContent from '@/core/ui/content/PageContent';
import { ContributeCreationBlock } from '@/domain/space/components/ContributeCreationBlock';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import InfoColumn from '@/core/ui/content/InfoColumn';
import ContentColumn from '@/core/ui/content/ContentColumn';
import CalloutsList from '@/domain/collaboration/callout/calloutsList/CalloutsList';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useSpaceTabProvider from '../../SpaceTabProvider';
import Loading from '@/core/ui/loading/Loading';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { buildFlowStateClassificationTagsets } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import CalloutsSetTagCloud from '@/domain/collaboration/calloutsSet/tagCloud/CalloutsSetTagCloud';
import { sortedUniq } from 'lodash';

const CreateCalloutDialog = lazyWithGlobalErrorHandler(
  () => import('@/domain/collaboration/callout/CalloutDialogs/CreateCalloutDialog')
);

type FlowStateTabPageProps = {
  sectionIndex: number;
};

const FlowStateTabPage = ({ sectionIndex }: FlowStateTabPageProps) => {
  const { urlInfo, classificationTagsets, flowStateForNewCallouts, tabDescription } = useSpaceTabProvider({
    tabPosition: sectionIndex,
  });
  const { calloutsSetId } = urlInfo;

  const { t } = useTranslation();

  const [isCalloutCreationDialogOpen, setIsCalloutCreationDialogOpen] = useState(false);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);

  const { callouts, canCreateCallout, loading, onCalloutsSortOrderUpdate, refetchCallout } = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
    tagsFilter,
  });

  return (
    <>
      <PageContent>
        <InfoColumn>
          <ContributeCreationBlock
            canCreate={canCreateCallout}
            handleCreate={() => setIsCalloutCreationDialogOpen(true)}
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
          <CalloutsSetTagCloud
            calloutsSetId={calloutsSetId}
            classificationTagsets={classificationTagsets}
            selectedTags={tagsFilter}
            resultsCount={callouts?.length}
            onSelectTag={tag =>
              setTagsFilter(tagsFilter => sortedUniq([...tagsFilter, tag].sort((a, b) => a.localeCompare(b))))
            }
            onDeselectTag={tag => setTagsFilter(tagsFilter => tagsFilter.filter(t => t !== tag))}
            onClear={() => setTagsFilter([])}
          />
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
      <Suspense fallback={null}>
        <CreateCalloutDialog
          open={isCalloutCreationDialogOpen}
          onClose={() => setIsCalloutCreationDialogOpen(false)}
          calloutsSetId={calloutsSetId}
          calloutClassification={buildFlowStateClassificationTagsets(flowStateForNewCallouts?.displayName || '')}
        />
      </Suspense>
    </>
  );
};

export default FlowStateTabPage;
