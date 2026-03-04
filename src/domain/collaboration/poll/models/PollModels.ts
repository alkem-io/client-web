import { PollResultsDetail, PollResultsVisibility, PollStatus } from '@/core/apollo/generated/graphql-schema';

export type PollSettingsModel = {
  minResponses: number;
  maxResponses: number;
  resultsVisibility: PollResultsVisibility;
  resultsDetail: PollResultsDetail;
};

export type PollOptionModel = {
  id: string;
  text: string;
  sortOrder: number;
  voteCount: number | null;
  votePercentage: number | null;
  voters:
    | {
        id: string;
        profile: {
          id: string;
          displayName: string;
          visual?: {
            id: string;
            uri: string;
          };
        };
      }[]
    | null;
};

export type PollVoteModel = {
  id: string;
  selectedOptionIds: string[];
};

export type PollDetailsModel = {
  id: string;
  title: string;
  status: PollStatus;
  settings: PollSettingsModel;
  totalVotes: number | null;
  canSeeDetailedResults: boolean;
  options: PollOptionModel[];
  myVote: PollVoteModel | null;
};

export type PollFormValues = {
  title: string;
  options: string[];
  settings: PollSettingsFormValues;
};

export type PollSettingsFormValues = {
  minResponses: number;
  maxResponses: number;
  resultsVisibility: PollResultsVisibility;
  resultsDetail: PollResultsDetail;
};
