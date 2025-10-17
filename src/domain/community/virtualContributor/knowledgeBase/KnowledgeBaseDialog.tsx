import { Trans, useTranslation } from 'react-i18next';
import { Box, Button, DialogActions, DialogContent } from '@mui/material';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import useKnowledgeBase from './useKnowledgeBase';
import { DescriptionComponent } from '@/domain/common/description/DescriptionComponent';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import { Caption } from '@/core/ui/typography';
import Loading from '@/core/ui/loading/Loading';
import { useVirtualContributorKnowledgeBaseLastUpdatedQuery } from '@/core/apollo/generated/apollo-hooks';
import { formatDateTime } from '@/core/utils/time/utils';

type KnowledgeBaseDialogProps = {
  onClose: () => void;
  title: string;
  id: string;
  placeholder: string;
};

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

  const { data } = useVirtualContributorKnowledgeBaseLastUpdatedQuery({
    variables: { id },
    skip: !id,
  });
  const lastUpdated = data?.virtualContributor?.aiPersona?.bodyOfKnowledgeLastUpdated;

  if (!hasReadAccess && !loadingPrivileges) {
    return (
      <DialogWithGrid open columns={6} aria-labelledby="knowledge-base-dialog" onClose={onClose}>
        <DialogHeader
          id="knowledge-base-dialog"
          onClose={onClose}
          title={t('pages.virtualContributorProfile.knowledgeBase.noAccess.title')}
        />
        <DialogContent>
          <Caption>{t('pages.virtualContributorProfile.knowledgeBase.noAccess.description')}</Caption>
        </DialogContent>
      </DialogWithGrid>
    );
  }

  return (
    <DialogWithGrid open columns={10} aria-labelledby="knowledge-base-dialog" onClose={onClose}>
      <DialogHeader id="knowledge-base-dialog" onClose={onClose} title={title} />
      <DialogContent>
        {loadingPrivileges || loading ? (
          <Loading />
        ) : (
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
              disableClassification
              calloutRestrictions={{
                disableRichMedia: true,
                disableWhiteboards: true,
                disableMemos: true,
                disableComments: true,
              }}
            />
          </Gutters>
        )}
      </DialogContent>
      {canCreateCallout && (
        <>
          <Box sx={{ fontSize: 14, color: 'text.primary', padding: 2 }}>
            <Trans
              i18nKey={'pages.virtualContributorProfile.settings.ingestion.infoText'}
              components={{ bold: <b /> }}
            />
          </Box>
          <DialogActions>
            <Box sx={{ color: 'muted.main', display: 'flex', fontSize: 14 }}>
              {t('pages.virtualContributorProfile.settings.ingestion.lastUpdatedLabel')}
              {lastUpdated
                ? formatDateTime(lastUpdated)
                : t('pages.virtualContributorProfile.settings.ingestion.never')}
            </Box>

            <Button
              variant="outlined"
              startIcon={<SyncOutlinedIcon />}
              loading={ingestLoading}
              onClick={ingestKnowledge}
            >
              {t('pages.virtualContributorProfile.settings.ingestion.refreshBtn')}
            </Button>
          </DialogActions>
        </>
      )}
    </DialogWithGrid>
  );
};

export default KnowledgeBaseDialog;
