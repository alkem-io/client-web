interface VisualUpload {
  file: File | undefined;
  altText?: string;
}

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
    avatar: VisualUpload;
    cardBanner: VisualUpload;
  };
}

export interface SpaceCreationForm {
  isSubmitting: boolean;
  onValidChanged: (valid: boolean) => void;
  onChanged: (value: SpaceFormValues) => void;
}
