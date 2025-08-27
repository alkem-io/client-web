import BackButton from '@/core/ui/actions/BackButton';
import SaveButton from '@/core/ui/actions/SaveButton';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { DialogActions, DialogContent } from '@mui/material';
import { ComponentType, RefAttributes, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContributionsSettings from './ContributionsSettings';
import Gutters from '@/core/ui/grid/Gutters';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { CalloutRestrictions } from '@/domain/collaboration/callout/CalloutRestrictionsTypes';
import { FramingSettings } from '../CalloutFormContributionSettings';

/**
 * Specific settings for the contribution type (e.g. post, link, whiteboard)
 * The settings components need to expose a ref that implements this interface
 *
 * The switches box at the bottom of the dialog are also implementing this same interface
 */
export interface ContributionTypeSettingsComponentRef {
  /**
   * Will be called when the user clicks Save in the dialog, then the Formik state of the callout form
   * needs to be updated by the component with the changes made in it.
   */
  onSave: () => void;

  /**
   * Check if the form has any unsaved changes
   */
  isContentChanged: () => boolean;
}

export interface ContributionTypeSettingsProps extends RefAttributes<ContributionTypeSettingsComponentRef> {
  calloutRestrictions?: CalloutRestrictions;
}

interface ContributionSettingsDialogProps {
  open?: boolean;
  onClose: () => void;
  contributionTypeSettingsComponent?: ComponentType<ContributionTypeSettingsProps> | undefined;
  calloutRestrictions?: CalloutRestrictions;
  enabledSettings: FramingSettings;
}

const ContributionSettingsDialog = ({
  open = false,
  onClose,
  contributionTypeSettingsComponent: SettingsComponent,
  calloutRestrictions,
  enabledSettings,
}: ContributionSettingsDialogProps) => {
  const { t } = useTranslation();
  const contributionSettingsRef = useRef<ContributionTypeSettingsComponentRef>(null);
  const settingsComponentRef = useRef<ContributionTypeSettingsComponentRef>(null);

  const [confirmBackDialogOpen, setConfirmBackDialogOpen] = useState<boolean>(false);
  const handleBack = () => {
    if (settingsComponentRef.current?.isContentChanged() || contributionSettingsRef.current?.isContentChanged()) {
      setConfirmBackDialogOpen(true);
    } else {
      onClose();
    }
  };

  // Form changes doesn't take effect into formik state until the user clicks save
  const handleSave = () => {
    contributionSettingsRef.current?.onSave();
    settingsComponentRef.current?.onSave();
    onClose();
  };

  return (
    <>
      <DialogWithGrid columns={6} open={open} onClose={handleBack} aria-labelledby="contribution-settings-dialog-title">
        <DialogHeader
          title={t('callout.create.contributionSettings.contributionTypes.settings.title')}
          onClose={handleBack}
          id="contribution-settings-dialog-title"
        />
        <DialogContent>
          <Gutters disablePadding>
            {SettingsComponent && (
              <SettingsComponent ref={settingsComponentRef} calloutRestrictions={calloutRestrictions} />
            )}
            <ContributionsSettings
              ref={contributionSettingsRef}
              calloutRestrictions={calloutRestrictions}
              enabledSettings={enabledSettings}
            />
          </Gutters>
        </DialogContent>
        <DialogActions>
          <BackButton onClick={handleBack} />
          <SaveButton onClick={handleSave} />
        </DialogActions>
      </DialogWithGrid>
      {/* Close confirmation dialog */}
      <ConfirmationDialog
        entities={{
          titleId: 'callout.create.contributionSettings.contributionTypes.settings.confirmBackDialog.title',
          contentId: 'callout.create.contributionSettings.contributionTypes.settings.confirmBackDialog.text',
          confirmButtonTextId:
            'callout.create.contributionSettings.contributionTypes.settings.confirmBackDialog.confirm',
        }}
        options={{
          show: confirmBackDialogOpen,
        }}
        actions={{
          onConfirm: () => {
            setConfirmBackDialogOpen(false);
            onClose();
          },
          onCancel: () => setConfirmBackDialogOpen(false),
        }}
      />
    </>
  );
};

export default ContributionSettingsDialog;
