import { object } from 'yup';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import { WhiteboardPreviewSettings } from '@/core/apollo/generated/graphql-schema';

export interface WhiteboardFormSchema {
  profile: {
    displayName: string;
  };
  previewSettings: WhiteboardPreviewSettings;
}

const whiteboardValidationSchema = object({
  profile: object({ displayName: displayNameValidator({ required: true }) }),
});

export default whiteboardValidationSchema;
