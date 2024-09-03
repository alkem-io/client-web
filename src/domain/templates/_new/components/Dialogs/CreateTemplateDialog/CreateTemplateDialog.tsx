import React, { useMemo } from 'react';
import { DialogHeaderProps } from '../../../../../../core/ui/dialog/DialogHeader';
import TemplateDialogBase from '../TemplateDialogBase';
import { CalloutType, TemplateType } from '../../../../../../core/apollo/generated/graphql-schema';
import { AnyTemplate, NewTemplateBase } from '../../../models/TemplateBase';
import TemplateForm, { AnyTemplateFormSubmittedValues } from '../../Forms/TemplateForm';

interface CreateTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;
  templateType: TemplateType;
}

const newEmptyTemplate = (templateType: TemplateType): AnyTemplate => {
  const common: NewTemplateBase = {
    id: '',
    type: templateType,
    profile: {
      displayName: '',
      description: '',
      tagset: {
        id: '',
        name: 'default',
        tags: [],
      },
    },
  };

  switch (templateType) {
    case TemplateType.Callout:
      return {
        ...common,
        type: TemplateType.Callout,
        callout: {
          id: '',
          type: CalloutType.Post,
          profile: {
            displayName: '',
            description: '',
            references: [],
          },
        }
      };
    case TemplateType.CommunityGuidelines:
      return {
        ...common,
        type: TemplateType.CommunityGuidelines,
        guidelines: {
          id: '',
          profile: {
            displayName: '',
            description: '',
            references: [],
          }
        }
      };
    case TemplateType.InnovationFlow:
      return {
        ...common,
        type: TemplateType.InnovationFlow,
        innovationFlowStates: []
      };
    case TemplateType.Post:
      return {
        ...common,
        type: TemplateType.Post,
        postDefaultDescription: '',
      };
    case TemplateType.Whiteboard:
      return {
        ...common,
        type: TemplateType.Whiteboard,
        whiteboard: {
          id: '',
        }
      };
  }
};

const CreateTemplateDialog = ({ templateType, open, onClose, onSubmit }: CreateTemplateDialogProps) => {

  const template = useMemo(() => newEmptyTemplate(templateType), [templateType]);

  return (
    <TemplateDialogBase
      open={open}
      onClose={onClose}
      templateType={templateType}
    >
      {({ actions }) => (
        <TemplateForm
          template={template}
          onSubmit={onSubmit}
          actions={actions}
        />
      )}
    </TemplateDialogBase>
  );
};

export default CreateTemplateDialog;
