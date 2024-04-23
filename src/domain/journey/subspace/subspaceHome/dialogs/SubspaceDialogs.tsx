import React from 'react';
import CalloutsListDialog from '../../../../collaboration/callout/CalloutsListDialog/CalloutsListDialog';
import useNavigate from '../../../../../core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { UseCalloutsProvided } from '../../../../collaboration/callout/useCallouts/useCallouts';
import { SubspaceDialog } from '../../layout/SubspaceDialog';
import SubspacesListDialog from '../../dialogs/SubspacesListDialog';
import ContributorsToggleDialog from '../../dialogs/ContributorsToggleDialog';
import ActivityDialog from '../../../common/Activity/ActivityDialog';

export interface SubspaceDialogsProps {
  dialogOpen: SubspaceDialog | undefined;
  journeyId: string | undefined;
  journeyUrl: string | undefined;
  callouts: UseCalloutsProvided;
}

const SubspaceDialogs = ({ dialogOpen, journeyUrl, callouts, journeyId }: SubspaceDialogsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  if (!dialogOpen || !journeyId || !journeyUrl) {
    return null;
  }
  return (
    <>
      <CalloutsListDialog
        open={dialogOpen === SubspaceDialog.Index}
        onClose={() => navigate(journeyUrl)}
        callouts={callouts.callouts}
        loading={callouts.loading}
        emptyListCaption={t('pages.generic.sections.subentities.empty', {
          entities: t('common.collaborationTools'),
        })}
      />
      <SubspacesListDialog
        journeyId={journeyId}
        open={dialogOpen === SubspaceDialog.Subspaces}
        onClose={() => navigate(journeyUrl)}
      />
      <ContributorsToggleDialog
        journeyId={journeyId}
        open={dialogOpen === SubspaceDialog.Contributors}
        onClose={() => navigate(journeyUrl)}
      />
      <ActivityDialog
        journeyId={journeyId}
        open={dialogOpen === SubspaceDialog.Activity}
        onClose={() => navigate(journeyUrl)}
      />
    </>
  );
};

export default SubspaceDialogs;
