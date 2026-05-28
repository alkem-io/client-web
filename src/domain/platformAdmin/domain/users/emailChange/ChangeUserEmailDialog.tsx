import { Alert, Button, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { gutters } from '@/core/ui/grid/utils';
import { BlockSectionTitle } from '@/core/ui/typography';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import {
  APPROVER_FIELD_MAX_LENGTH,
  type ChangeUserEmailFormValues,
  changeUserEmailInitialValues,
  changeUserEmailSchema,
  REASON_MAX_LENGTH,
} from './changeUserEmailSchema';
import ResolveEmailDriftDialog from './ResolveEmailDriftDialog';
import useChangeUserEmail from './useChangeUserEmail';
import useLatestUserEmailChangeOutcome from './useLatestUserEmailChangeOutcome';

type ChangeUserEmailDialogProps = {
  open: boolean;
  userId: string;
  currentEmail: string;
  onClose: () => void;
};

const DIALOG_ID = 'change-user-email-dialog';

const ChangeUserEmailDialog = ({ open, userId, currentEmail, onClose }: ChangeUserEmailDialogProps) => {
  const { t } = useTranslation();
  const { changeEmail, loading, errorMessage, clearError } = useChangeUserEmail(userId);
  const drift = useLatestUserEmailChangeOutcome(userId, { skip: !open });
  const navigate = useNavigate();
  const [resolveOpen, setResolveOpen] = useState(false);

  const handleClose = () => {
    clearError();
    onClose();
  };

  const handleOpenHistory = () => {
    navigate(`/admin/users/${userId}/email-history`);
  };

  const handleSubmit = async ({ newEmail, reason, approver }: ChangeUserEmailFormValues) => {
    const success = await changeEmail({ newEmail, reason, approver });
    if (success) {
      handleClose();
    }
  };

  return (
    <>
      <DialogWithGrid open={open} onClose={handleClose} aria-labelledby={DIALOG_ID}>
        <DialogHeader id={DIALOG_ID} title={t('pages.admin.users.emailChange.dialog.title')} onClose={handleClose} />
        <Formik
          initialValues={changeUserEmailInitialValues}
          validationSchema={changeUserEmailSchema(currentEmail)}
          validateOnMount={true}
          onSubmit={handleSubmit}
        >
          {({ submitForm, isValid }) => (
            <>
              <PageContentBlockSeamless>
                {drift.isDrifted && (
                  <Alert
                    severity="warning"
                    action={
                      <Button color="inherit" size="small" onClick={() => setResolveOpen(true)}>
                        {t('pages.admin.users.emailChange.drift.resolveAction')}
                      </Button>
                    }
                  >
                    {t('pages.admin.users.emailChange.drift.banner')}
                  </Alert>
                )}
                <TextField
                  label={t('pages.admin.users.emailChange.dialog.currentEmailLabel')}
                  value={currentEmail}
                  disabled={true}
                  fullWidth={true}
                />
                <FormikInputField
                  name="newEmail"
                  title={t('pages.admin.users.emailChange.dialog.newEmailLabel')}
                  required={true}
                  autoComplete="off"
                  disabled={loading}
                />
                <FormikInputField
                  name="confirmEmail"
                  title={t('pages.admin.users.emailChange.dialog.confirmEmailLabel')}
                  required={true}
                  autoComplete="off"
                  disabled={loading}
                />
                <BlockSectionTitle>{t('pages.admin.users.emailChange.dialog.approvalSection')}</BlockSectionTitle>
                <FormikInputField
                  name="reason"
                  title={t('pages.admin.users.emailChange.dialog.reasonLabel')}
                  helperText={t('pages.admin.users.emailChange.dialog.reasonHelp')}
                  required={true}
                  rows={3}
                  maxLength={REASON_MAX_LENGTH}
                  disabled={loading}
                />
                <FormikInputField
                  name="approver.name"
                  title={t('pages.admin.users.emailChange.dialog.approverNameLabel')}
                  required={true}
                  maxLength={APPROVER_FIELD_MAX_LENGTH}
                  disabled={loading}
                />
                <FormikInputField
                  name="approver.role"
                  title={t('pages.admin.users.emailChange.dialog.approverRoleLabel')}
                  required={true}
                  maxLength={APPROVER_FIELD_MAX_LENGTH}
                  disabled={loading}
                />
                <FormikInputField
                  name="approver.organization"
                  title={t('pages.admin.users.emailChange.dialog.approverOrganizationLabel')}
                  maxLength={APPROVER_FIELD_MAX_LENGTH}
                  disabled={loading}
                />
                <Alert severity="warning">{t('pages.admin.users.emailChange.dialog.sessionWarning')}</Alert>
                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
              </PageContentBlockSeamless>
              <Actions padding={gutters()}>
                <Button onClick={handleOpenHistory}>{t('pages.admin.users.emailChange.history.linkLabel')}</Button>
                <FlexSpacer />
                <Button onClick={handleClose} disabled={loading}>
                  {t('buttons.cancel')}
                </Button>
                <Button variant="contained" onClick={submitForm} loading={loading} disabled={!isValid || loading}>
                  {t('pages.admin.users.emailChange.dialog.submit')}
                </Button>
              </Actions>
            </>
          )}
        </Formik>
      </DialogWithGrid>
      <ResolveEmailDriftDialog
        open={resolveOpen}
        userId={userId}
        oldEmail={drift.oldEmail}
        newEmail={drift.newEmail}
        onClose={() => setResolveOpen(false)}
      />
    </>
  );
};

export default ChangeUserEmailDialog;
