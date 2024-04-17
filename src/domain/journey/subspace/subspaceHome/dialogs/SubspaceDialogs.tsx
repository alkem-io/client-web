import React from 'react';
import CalloutsListDialog from '../../../../collaboration/callout/CalloutsListDialog/CalloutsListDialog';
import useNavigate from '../../../../../core/routing/useNavigate';
import JourneyCalloutsListItemTitle from '../../../../collaboration/callout/JourneyCalloutsTabView/JourneyCalloutsListItemTitle';
import { useTranslation } from 'react-i18next';
import { TypedCallout } from '../../../../collaboration/callout/useCallouts/useCallouts';
import { SubspaceDialog } from '../../layout/SubspaceDialog';
import SubspacesListDialog from '../../dialogs/SubspacesListDialog';

export interface SubspaceDialogsProps {
  dialog: SubspaceDialog | undefined;
  callouts: TypedCallout[];
  journeyId: string | undefined;
}

const SubspaceDialogs = ({ dialog, callouts, journeyId }: SubspaceDialogsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <CalloutsListDialog
        open={dialog === SubspaceDialog.Index}
        onClose={() => navigate('./')}
        callouts={callouts}
        renderCallout={callout => <JourneyCalloutsListItemTitle callout={callout} />}
        emptyListCaption={t('pages.generic.sections.subentities.empty-list', {
          entities: t('common.callouts'),
        })}
      />
      {journeyId && (
        <SubspacesListDialog
          journeyId={journeyId}
          open={dialog === SubspaceDialog.Subspaces}
          onClose={() => navigate('./')}
        />
      )}
    </>
  );
};

export default SubspaceDialogs;
