import { useTranslation } from 'react-i18next';
import React from 'react';
import EditCalloutTemplateForm from './EditCalloutTemplateForm';
import { UpdateTemplateInput } from '../../../../core/apollo/generated/graphql-schema';
import { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { useCalloutTemplateEditableAttributesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import CreateEditTemplateDialogBase from '../../_new/components/Dialogs/CreateEditTemplateDialog/CreateEditTemplateDialogBase';

export interface EditCalloutTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: UpdateTemplateInput) => void;
  onDelete: () => void;
  template: Identifiable | undefined;
}

const EditCalloutTemplateDialog = ({ template, open, onClose, onSubmit, onDelete }: EditCalloutTemplateDialogProps) => {
  const { t } = useTranslation();

  const { data } = useCalloutTemplateEditableAttributesQuery({
    variables: {
      templateId: template?.id!,
    },
    skip: !template?.id,
  });

  return (
    <CreateEditTemplateDialogBase
      open={open}
      onClose={onClose}
      templateTypeName={t('templateLibrary.calloutTemplates.name')}
      onDelete={onDelete}
      editMode
    >
      {({ actions }) => (
        <EditCalloutTemplateForm template={data?.lookup.template} onSubmit={onSubmit} actions={actions} />
      )}
    </CreateEditTemplateDialogBase>
  );
};

export default EditCalloutTemplateDialog;
