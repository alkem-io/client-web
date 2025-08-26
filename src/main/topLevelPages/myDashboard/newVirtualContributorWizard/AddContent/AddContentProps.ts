import {
  CalloutAllowedContributors,
  CalloutContributionType,
  CalloutVisibility,
} from '@/core/apollo/generated/graphql-schema';

export type PostValues = {
  title: string;
  description: string;
};

export interface DocumentValues {
  name: string;
  url: string;
}

export interface BoKCalloutsFormValues {
  posts: PostValues[];
  documents: DocumentValues[];
}

export type AddContentProps = {
  onClose: () => void;
  onCreateVC: (values: BoKCalloutsFormValues) => Promise<void>;
  titleId?: string;
};

export const getPostCalloutRequestData = (title: string, description: string) => ({
  framing: {
    profile: {
      description: description,
      displayName: title,
      tagsets: [],
      referencesData: [],
    },
  },
  settings: {
    framing: {
      commentsEnabled: false,
    },
    visibility: CalloutVisibility.Published,
  },
  sendNotification: false,
});

export const getDocumentCalloutRequestData = (name: string) => ({
  framing: {
    profile: {
      displayName: name,
      description: '',
      tagsets: [],
      referencesData: [],
    },
  },
  settings: {
    framing: {
      commentsEnabled: false,
    },
    contribution: {
      enabled: true,
      allowedTypes: [CalloutContributionType.Link],
      canAddContributions: CalloutAllowedContributors.Members,
      commentsEnabled: false,
    },
    visibility: CalloutVisibility.Published,
  },
  sendNotification: false,
});
