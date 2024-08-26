import { useTranslation } from 'react-i18next';
import React from 'react';
import EditCalloutTemplateForm from './EditCalloutTemplateForm';
import { CalloutType, UpdateTemplateInput } from '../../../../core/apollo/generated/graphql-schema';
import { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { useCalloutTemplateEditableAttributesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import TemplateDialogBase from '../../Dialogs/templateDialog/TemplateDialogBase';

export interface EditCalloutTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: UpdateTemplateInput & { type: CalloutType }) => void;
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
    <TemplateDialogBase
      open={open}
      onClose={onClose}
      templateTypeName={t('templateLibrary.calloutTemplates.name')}
      onDelete={onDelete}
      editMode
    >
      {({ actions }) => (
        <EditCalloutTemplateForm template={data?.lookup.template} onSubmit={onSubmit} actions={actions} />
      )}
    </TemplateDialogBase>
  );
};

export default EditCalloutTemplateDialog;
