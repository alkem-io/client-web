import { VisualUploadModel } from '@/core/ui/upload/VisualUpload/VisualUpload.model';

export interface SpaceFormValues {
  displayName: string;
  tagline: string;
  why?: string;
  tags: string[];
  description?: string;
  addTutorialCallouts: boolean;
  addCallouts?: boolean;
  spaceTemplateId?: string;
  visuals: {
    avatar: VisualUploadModel;
    cardBanner: VisualUploadModel;
  };
}

export interface SpaceCreationForm {
  isSubmitting: boolean;
  onValidChanged: (valid: boolean) => void;
  onChanged: (value: SpaceFormValues) => void;
}
