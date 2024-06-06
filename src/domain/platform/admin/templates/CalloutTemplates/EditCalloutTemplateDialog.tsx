import { useTranslation } from 'react-i18next';
import { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import TemplateDialogBase from '../../../../collaboration/templates/templateDialog/TemplateDialogBase';
import { UpdateCalloutTemplateInput } from '../../../../../core/apollo/generated/graphql-schema';
import { useCalloutTemplateEditableAttributesQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import EditCalloutTemplateForm from './EditCalloutTemplateForm';
import { Identifiable } from '../../../../../core/utils/Identifiable';

export interface EditCalloutTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: UpdateCalloutTemplateInput) => void;
  template: Identifiable | undefined;
}

const EditCalloutTemplateDialog = ({ template, open, onClose, onSubmit }: EditCalloutTemplateDialogProps) => {
  const { t } = useTranslation();

  const { data } = useCalloutTemplateEditableAttributesQuery({
    variables: {
      templateId: template?.id!,
    },
    skip: !template?.id,
  });

  return (
    <TemplateDialogBase open={open} onClose={onClose} templateTypeName={t('templateLibrary.calloutTemplates.name')} editMode>
      {({ actions }) => <EditCalloutTemplateForm template={data?.lookup.calloutTemplate} onSubmit={onSubmit} actions={actions} />}
    </TemplateDialogBase>
  );
};

export default EditCalloutTemplateDialog;
