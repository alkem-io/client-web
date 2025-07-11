import { VisualUploadModel } from '@/core/ui/upload/VisualUpload/VisualUpload.model';

export interface SpaceCreationForm {
  isSubmitting: boolean;
  onValidChanged: (valid: boolean) => void;
  onChanged: (value: SpaceFormValues) => void;
}

// All form fields are here for both space and subspace creation, each of the forms Pick the fields they need
// Just define as optional the fields that are not needed in one of them, and do the validation properly in the form
export interface SpaceFormValues {
  displayName: string;
  nameId?: string; // Space only
  tagline: string;
  why?: string; // Subspace only
  tags: string[];
  description?: string;
  addTutorialCallouts: boolean;
  addCallouts?: boolean;
  spaceTemplateId?: string;
  visuals: {
    avatar?: VisualUploadModel; // Subspace only
    cardBanner?: VisualUploadModel;
    banner?: VisualUploadModel; // Space only
  };
}
