import { useTranslation } from 'react-i18next';
import { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import { CalloutType, UpdateTemplateInput } from '../../../../../core/apollo/generated/graphql-schema';
import { useCalloutTemplateEditableAttributesQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import EditCalloutTemplateForm from './EditCalloutTemplateForm';
import { Identifiable } from '../../../../../core/utils/Identifiable';
import TemplateDialogBase from '../../../../templates/Dialogs/templateDialog/TemplateDialogBase';

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
