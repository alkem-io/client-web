import * as yup from 'yup';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import { WhiteboardPreviewSettings } from '../WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';

export interface WhiteboardFormSchema {
  profile: {
    displayName: string;
  };
  previewSettings: WhiteboardPreviewSettings;
}

const whiteboardValidationSchema = yup.object({
  profile: yup.object({ displayName: displayNameValidator({ required: true }) }).required(),
  previewSettings: yup
    .object({
      mode: yup.string().required(),
      coordinates: yup
        .object({
          x: yup.number(),
          y: yup.number(),
          width: yup.number(),
          height: yup.number(),
        })
        .optional(),
    })
    .required(),
});

export default whiteboardValidationSchema;
