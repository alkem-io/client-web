import {
  CalloutAllowedActors,
  CalloutContributionType,
  CalloutVisibility,
} from '@/core/apollo/generated/graphql-schema';

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
      canAddContributions: CalloutAllowedActors.Members,
      commentsEnabled: false,
    },
    visibility: CalloutVisibility.Published,
  },
  sendNotification: false,
});
