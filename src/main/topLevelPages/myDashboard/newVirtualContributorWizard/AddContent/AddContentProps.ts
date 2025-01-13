import { CalloutGroupName, CalloutState, CalloutType, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';

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
  spaceId: string;
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
  groupName: CalloutGroupName.Knowledge,
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
  groupName: CalloutGroupName.Knowledge,
  visibility: CalloutVisibility.Published,
  sendNotification: false,
});
