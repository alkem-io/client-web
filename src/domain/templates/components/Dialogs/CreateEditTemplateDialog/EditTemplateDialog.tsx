import React from 'react';
import { DialogHeaderProps } from '@/core/ui/dialog/DialogHeader';

import CreateEditTemplateDialogBase from './CreateEditTemplateDialogBase';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { AnyTemplate } from '../../../models/TemplateBase';
import TemplateForm, { AnyTemplateFormSubmittedValues } from '../../Forms/TemplateForm';
import { useTemplateContentQuery } from '@/core/apollo/generated/apollo-hooks';
import { CircularProgress } from '@mui/material';

interface EditTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;
  onDelete?: () => void;
  template: AnyTemplate | undefined;
  templateType: TemplateType;
}

const EditTemplateDialog = ({ template, templateType, open, onClose, onSubmit, onDelete }: EditTemplateDialogProps) => {
  const { data, loading } = useTemplateContentQuery({
    variables: {
      templateId: template?.id!,
      includeCallout: templateType === TemplateType.Callout,
      includeCommunityGuidelines: templateType === TemplateType.CommunityGuidelines,
      includeInnovationFlow: templateType === TemplateType.InnovationFlow,
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
