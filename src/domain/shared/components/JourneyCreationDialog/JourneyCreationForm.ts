interface VisualUpload {
  file: File | undefined;
  altText?: string;
}

export interface JourneyFormValues {
  displayName: string;
  tagline: string;
  vision?: string;
  tags: string[];
  background?: string;
  addTutorialCallouts: boolean;
  collaborationTemplateId?: string;
  visuals: {
    avatar: VisualUpload;
    cardBanner: VisualUpload;
  };
}

export interface JourneyCreationForm {
  isSubmitting: boolean;
  onValidChanged: (valid: boolean) => void;
  onChanged: (value: JourneyFormValues) => void;
}
