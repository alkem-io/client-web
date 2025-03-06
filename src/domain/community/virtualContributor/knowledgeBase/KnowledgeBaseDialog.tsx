import { useTranslation } from 'react-i18next';
import { DialogActions, DialogContent } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import useKnowledgeBase from './useKnowledgeBase';
import { CalloutType } from '@/core/apollo/generated/graphql-schema';
import { DescriptionComponent } from '@/domain/common/description/DescriptionComponent';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { Caption } from '@/core/ui/typography';
import { Loading } from '@/core/ui/loading/Loading';

type KnowledgeBaseDialogProps = {
  onClose: () => void;
  title: string;
  id: string;
  placeholder: string;
};

const AVAILABLE_CALLOUT_TYPES = [CalloutType.Post, CalloutType.LinkCollection, CalloutType.PostCollection];

const KnowledgeBaseDialog = ({ onClose, title, id, placeholder }: KnowledgeBaseDialogProps) => {
  const { t } = useTranslation();
  const {
    calloutsSetId,
    callouts,
    canCreateCallout,
    loading,
    calloutsSetLoading,
    onCalloutsSortOrderUpdate,
    refetchCallout,
    knowledgeBaseDescription,
    updateDescription,
    ingestKnowledge,
    ingestLoading,
    hasReadAccess,

    loadingPrivileges,
  } = useKnowledgeBase({ id });

  if (!hasReadAccess && !loadingPrivileges) {
    return (
      <DialogWithGrid open columns={6}>
        <DialogHeader onClose={onClose} title={t('pages.virtualContributorProfile.knowledgeBase.noAccess.title')} />
        <DialogContent>
          <Caption>{t('pages.virtualContributorProfile.knowledgeBase.noAccess.description')}</Caption>
        </DialogContent>
      </DialogWithGrid>
    );
  }

  return (
    <DialogWithGrid open columns={10}>
      <DialogHeader onClose={onClose} title={title} />
      <DialogContent>
        {loadingPrivileges || loading ? (
          <Loading />
        ) : (
          <StorageConfigContextProvider locationType="virtualContributor" virtualContributorId={id}>
            <Gutters disablePadding>
              {(placeholder || knowledgeBaseDescription || canCreateCallout) && (
                <DescriptionComponent
                  description={knowledgeBaseDescription || placeholder}
                  canEdit={canCreateCallout}
                  onUpdate={updateDescription}
                />
              )}
              <CalloutsGroupView
                calloutsSetId={calloutsSetId}
                callouts={callouts}
                canCreateCallout={canCreateCallout}
                loading={calloutsSetLoading}
                onSortOrderUpdate={onCalloutsSortOrderUpdate}
                onCalloutUpdate={refetchCallout}
                createButtonPlace="bottom"
                availableCalloutTypes={AVAILABLE_CALLOUT_TYPES}
                disableRichMedia
                disablePostResponses
              />
            </Gutters>
          </StorageConfigContextProvider>
        )}
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
