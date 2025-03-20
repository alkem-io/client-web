import { CalloutState, CalloutType, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';

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
  type: CalloutType.Post,
  contributionPolicy: {
    state: CalloutState.Closed,
  },
  visibility: CalloutVisibility.Published,
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
  type: CalloutType.LinkCollection,
  contributionPolicy: {
    state: CalloutState.Open,
  },
  visibility: CalloutVisibility.Published,
  sendNotification: false,
});
