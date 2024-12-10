import { DialogHeaderProps } from '@/core/ui/dialog/DialogHeader';

import CreateEditTemplateDialogBase from './CreateEditTemplateDialogBase';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import TemplateForm, { AnyTemplateFormSubmittedValues } from '@/domain/templates/components/Forms/TemplateForm';
import { useTemplateContentQuery } from '@/core/apollo/generated/apollo-hooks';
import { CircularProgress } from '@mui/material';

interface EditTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onCancel?: () => void;
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;
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
  const { data, loading } = useTemplateContentQuery({
    variables: {
      templateId: template?.id!,
      includeCallout: templateType === TemplateType.Callout,
      includeCommunityGuidelines: templateType === TemplateType.CommunityGuidelines,
      includeCollaboration: templateType === TemplateType.Collaboration,
      includePost: templateType === TemplateType.Post,
      includeWhiteboard: templateType === TemplateType.Whiteboard,
    },
    skip: !open || !template?.id,
  });
  const fullTemplate = data?.lookup.template;

  return (
    <CreateEditTemplateDialogBase
      open={open}
      onClose={onClose}
      onCancel={onCancel}
      templateType={templateType}
      onDelete={onDelete}
      editMode
    >
      {({ actions }) => (
        <>
          {loading && <CircularProgress />}
          {!loading && fullTemplate && <TemplateForm template={fullTemplate} onSubmit={onSubmit} actions={actions} />}
        </>
      )}
    </CreateEditTemplateDialogBase>
  );
};

export default EditTemplateDialog;
