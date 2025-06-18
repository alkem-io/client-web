import BackButton from '@/core/ui/actions/BackButton';
import SaveButton from '@/core/ui/actions/SaveButton';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { DialogActions, DialogContent } from '@mui/material';
import { ComponentType, RefAttributes, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ResponseSettingsContribution from './ResponseSettingsContribution';
import Gutters from '@/core/ui/grid/Gutters';

/**
 * Settings component needs to expose a ref that implements this interface
 */
export interface ContributionTypeSettingsComponentRef {
  /**
   * Will be called when the user clicks save in the dialog, then the Formik state needs to be updated with the changes made in the component
   * @returns
   */
  onSave: () => void;
}

interface CalloutFormResponseSettingsDialogProps {
  open?: boolean;
  onClose: () => void;
  settingsComponent?: ComponentType<RefAttributes<ContributionTypeSettingsComponentRef>> | undefined;
}

const CalloutFormResponseSettingsDialog = ({
  open = false,
  onClose,
  settingsComponent: SettingsComponent,
}: CalloutFormResponseSettingsDialogProps) => {
  const { t } = useTranslation();
  const contributionSettingsRef = useRef<ContributionTypeSettingsComponentRef>(null);
  const settingsComponentRef = useRef<ContributionTypeSettingsComponentRef>(null);

  // Form changes doesn't take effect into formik state until the user clicks save
  const handleSave = () => {
    contributionSettingsRef.current?.onSave();
    settingsComponentRef.current?.onSave();
    onClose();
  };

  return (
    <DialogWithGrid columns={6} open={open} onClose={onClose}>
      <DialogHeader title={t('callout.create.contributionSettings.contributionTypes.title')} onClose={onClose} />
      <DialogContent>
        <Gutters disablePadding>
          {SettingsComponent && <SettingsComponent ref={settingsComponentRef} />}
          <ResponseSettingsContribution ref={contributionSettingsRef} />
        </Gutters>
      </DialogContent>
      <DialogActions>
        <BackButton onClick={onClose} />
        <SaveButton onClick={handleSave} />
      </DialogActions>
    </DialogWithGrid>
  );
};

export default CalloutFormResponseSettingsDialog;
