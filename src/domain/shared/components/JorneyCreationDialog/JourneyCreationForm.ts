export interface JourneyFormValues {
  displayName: string;
  tagline: string;
  vision: string;
  tags: string[];
  background?: string;
  addDefaultCallouts: boolean;
}

export interface JourneyCreationForm {
  isSubmitting: boolean;
  onValidChanged: (valid: boolean) => void;
  onChanged: (value: JourneyFormValues) => void;
}
