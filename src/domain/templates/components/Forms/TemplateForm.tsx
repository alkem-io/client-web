import { ReactNode } from 'react';

import { FormikProps } from 'formik';

import InnovationFlowTemplateForm, {
  type InnovationFlowTemplateFormSubmittedValues,
} from './InnovationFlowTemplateForm';
import CommunityGuidelinesTemplateForm, {
  type CommunityGuidelinesTemplateFormSubmittedValues,
} from './CommunityGuidelinesTemplateForm';
import PostTemplateForm, { type PostTemplateFormSubmittedValues } from './PostTemplateForm';
import CalloutTemplateForm, { type CalloutTemplateFormSubmittedValues } from './CalloutTemplateForm';
import WhiteboardTemplateForm, { type WhiteboardTemplateFormSubmittedValues } from './WhiteboardTemplateForm';
import CollaborationTemplateForm, { type CollaborationTemplateFormSubmittedValues } from './CollaborationTemplateForm';

import { type AnyTemplate } from '../../models/TemplateBase';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';

const TemplateForm = ({ template, temporaryLocation = false, ...rest }: TemplateFormProps) => {
  switch (template.type) {
    case TemplateType.Whiteboard: {
      return <WhiteboardTemplateForm template={template} {...rest} />;
    }

    case TemplateType.Collaboration: {
      return <CollaborationTemplateForm template={template} {...rest} />;
    }

    case TemplateType.InnovationFlow: {
      return <InnovationFlowTemplateForm template={template} {...rest} />;
    }

    case TemplateType.Post: {
      return <PostTemplateForm template={template} temporaryLocation={temporaryLocation} {...rest} />;
    }

    case TemplateType.Callout: {
      return <CalloutTemplateForm template={template} temporaryLocation={temporaryLocation} {...rest} />;
    }

    case TemplateType.CommunityGuidelines: {
      return <CommunityGuidelinesTemplateForm template={template} temporaryLocation={temporaryLocation} {...rest} />;
    }

    default: {
      throw new Error('Template type not supported');
    }
  }
};

export default TemplateForm;

export type AnyTemplateFormSubmittedValues =
  | PostTemplateFormSubmittedValues
  | CalloutTemplateFormSubmittedValues
  | WhiteboardTemplateFormSubmittedValues
  | CollaborationTemplateFormSubmittedValues
  | InnovationFlowTemplateFormSubmittedValues
  | CommunityGuidelinesTemplateFormSubmittedValues;

type TemplateFormProps = {
  template: AnyTemplate;
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<AnyTemplate>) => ReactNode);

  temporaryLocation?: boolean;
};
