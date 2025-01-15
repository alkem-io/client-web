import { useTranslation } from 'react-i18next';
import { DialogActions, DialogContent } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import useKnowledgeBase from './useKnowledgeBase';
import { CalloutGroupName, CalloutType } from '@/core/apollo/generated/graphql-schema';
import { DescriptionComponent } from '@/domain/common/description/DescriptionComponent';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';

type KnowledgeBaseDialogProps = {
  onClose: () => void;
  title: string;
  id: string;
};

const AVAILABLE_CALLOUT_TYPES = [CalloutType.Post, CalloutType.LinkCollection, CalloutType.PostCollection];

const KnowledgeBaseDialog = ({ onClose, title, id }: KnowledgeBaseDialogProps) => {
  const { t } = useTranslation();
  const {
    calloutsSetId,
    callouts,
    canCreateCallout,
    loading,
    onCalloutsSortOrderUpdate,
    refetchCallout,
    knowledgeBaseDescription,
    updateDescription,
    ingestKnowledge,
    ingestLoading,
  } = useKnowledgeBase({ id });

  return (
    <DialogWithGrid open columns={10}>
      <DialogHeader onClose={onClose} title={title} />
      <DialogContent>
        <StorageConfigContextProvider locationType="virtualContributor" virtualContributorId={id}>
          <Gutters disablePadding>
            {(knowledgeBaseDescription || canCreateCallout) && (
              <DescriptionComponent
                description={knowledgeBaseDescription}
                canEdit={canCreateCallout}
                onUpdate={updateDescription}
              />
            )}
            <CalloutsGroupView
              calloutsSetId={calloutsSetId}
              callouts={callouts}
              canCreateCallout={canCreateCallout}
              loading={loading}
              journeyTypeName="space"
              onSortOrderUpdate={onCalloutsSortOrderUpdate}
              onCalloutUpdate={refetchCallout}
              groupName={CalloutGroupName.Knowledge}
              createButtonPlace="bottom"
              availableCalloutTypes={AVAILABLE_CALLOUT_TYPES}
              disableRichMedia
            />
          </Gutters>
        </StorageConfigContextProvider>
      </DialogContent>
      {canCreateCallout && (
        <DialogActions>
          <LoadingButton
            variant="outlined"
            startIcon={<SyncOutlinedIcon />}
            loading={ingestLoading}
            onClick={ingestKnowledge}
          >
            {t('pages.virtualContributorProfile.settings.ingestion.refreshBtn')}
          </LoadingButton>
        </DialogActions>
      )}
    </DialogWithGrid>
  );
};

export default KnowledgeBaseDialog;
