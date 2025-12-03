import CreateEditTemplateDialogBase from './CreateEditTemplateDialogBase';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import TemplateForm, { AnyTemplateFormSubmittedValues } from '@/domain/templates/components/Forms/TemplateForm';
import { useTemplateContentQuery } from '@/core/apollo/generated/apollo-hooks';
import { CircularProgress } from '@mui/material';
import { useState } from 'react';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { useTranslation } from 'react-i18next';

interface EditTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onCancel?: () => void;
  onSubmit: (values: AnyTemplateFormSubmittedValues) => Promise<unknown>;
  onDelete?: () => void;
  template: AnyTemplate | undefined;
  templateType: TemplateType;
}

const EditTemplateDialog = ({
  template,
  templateType,
  open,
  onClose,
  onCancel,
  onSubmit,
  onDelete,
}: EditTemplateDialogProps) => {
  const { t } = useTranslation();
  const [confirmCloseDialogOpen, setConfirmCloseDialogOpen] = useState<boolean>(false);
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);

  const { data, loading } = useTemplateContentQuery({
    variables: {
      templateId: template?.id!,
      includeCallout: templateType === TemplateType.Callout,
      includeCommunityGuidelines: templateType === TemplateType.CommunityGuidelines,
      includeSpace: templateType === TemplateType.Space,
      includePost: templateType === TemplateType.Post,
      includeWhiteboard: templateType === TemplateType.Whiteboard,
    },
    skip: !open || !template?.id,
  });
  const fullTemplate = data?.lookup.template;

  const handleClose = () => {
    if (isFormDirty) {
      setConfirmCloseDialogOpen(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <CreateEditTemplateDialogBase
        open={open}
        onClose={handleClose}
        onCancel={onCancel}
        templateType={templateType}
        onDelete={onDelete}
        onDirtyChange={setIsFormDirty}
        editMode
      >
        {({ actions }) => (
          <>
            {loading && <CircularProgress />}
            {!loading && fullTemplate && <TemplateForm template={fullTemplate} onSubmit={onSubmit} actions={actions} />}
          </>
        )}
      </CreateEditTemplateDialogBase>
      <ConfirmationDialog
        entities={{
          title: t('templateLibrary.importTemplateDialog.confirmClose.title'),
          content: t('templateLibrary.importTemplateDialog.confirmClose.description'),
          confirmButtonText: t('buttons.yesDiscard'),
        }}
        actions={{
          onCancel: () => setConfirmCloseDialogOpen(false),
          onConfirm: () => {
            onClose?.();
            setConfirmCloseDialogOpen(false);
          },
        }}
        options={{
          show: confirmCloseDialogOpen,
        }}
      />
    </>
  );
};

export default EditTemplateDialog;
