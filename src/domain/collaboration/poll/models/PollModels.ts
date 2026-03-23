import type { PollResultsDetail, PollResultsVisibility, PollStatus } from '@/core/apollo/generated/graphql-schema';

export type PollSettingsModel = {
  allowContributorsAddOptions: boolean;
  minResponses: number;
  maxResponses: number;
  resultsVisibility: PollResultsVisibility;
  resultsDetail: PollResultsDetail;
};

export type PollOptionModel = {
  id: string;
  text: string;
  sortOrder: number;
  voteCount?: number;
  votePercentage?: number;
  voters?: {
    id: string;
    profile?: {
      id: string;
      displayName: string;
      visual?: {
        id: string;
        uri: string;
      };
    };
  }[];
};

export type PollVoteModel = {
  id: string;
  selectedOptions: { id: string }[];
};

export type PollDetailsModel = {
  id: string;
  title: string;
  status: PollStatus;
  settings: PollSettingsModel;
  totalVotes?: number;
  canSeeDetailedResults: boolean;
  options: PollOptionModel[];
  myVote?: PollVoteModel;
};

export type PollFormOptionValue = {
  id?: string;
  text: string;
};

export type PollFormValues = {
  title: string;
  options: PollFormOptionValue[];
  settings: PollSettingsFormValues;
};

export type PollSettingsFormValues = {
  allowContributorsAddOptions: boolean;
  minResponses: number;
  maxResponses: number;
  resultsVisibility: PollResultsVisibility;
  resultsDetail: PollResultsDetail;
};

export type PollFormFieldSubmittedValues = {
  title: string;
  options: string[];
  settings: PollSettingsFormValues;
};
