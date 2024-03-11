export interface JourneyFormValues {
  displayName: string;
  tagline: string;
  vision: string;
  tags: string[];
  background?: string;
  innovationFlowTemplateId: string;
}

export interface JourneyCreationForm {
  isSubmitting: boolean;
  onValidChanged: (valid: boolean) => void;
  onChanged: (value: JourneyFormValues) => void;
}
