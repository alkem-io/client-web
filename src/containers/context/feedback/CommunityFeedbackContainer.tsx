import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../models/container';
import {
  useCommunityFeedbackTemplatesQuery,
  useCreateFeedbackOnCommunityContextMutation,
} from '../../../hooks/generated/graphql';
import { CreateNvpInput, FeedbackTemplate } from '../../../models/graphql-schema';
import { useCommunityContext } from '../../../context/CommunityProvider';
import { useApolloErrorHandler, useNotification } from '../../../hooks';
import { useTranslation } from 'react-i18next';

export type FeedbackDataEntry = { question: string; answer: string; sortOrder: number };

export interface CommunityFeedbackContainerEntities {
  templates: Omit<FeedbackTemplate, '__typename'>[];
}

export interface CommunityFeedbackContainerActions {
  onFeedbackSubmit: (data: FeedbackDataEntry[]) => void;
}

export interface CommunityFeedbackContainerState {
  loading: boolean;
  error?: ApolloError;
  isSubmitting: boolean;
  submitError?: ApolloError;
}

export interface CommunityFeedbackContainerProps
  extends ContainerChildProps<
    CommunityFeedbackContainerEntities,
    CommunityFeedbackContainerActions,
    CommunityFeedbackContainerState
  > {}

const CommunityFeedbackContainer: FC<CommunityFeedbackContainerProps> = ({ children }) => {
  const navigate = useNavigate();
  const handleError = useApolloErrorHandler();
  const notify = useNotification();
  const { t } = useTranslation();

  const { communityId } = useCommunityContext();
  const { data: templateQuery, loading, error: templateError } = useCommunityFeedbackTemplatesQuery();
  const [createFeedback, { loading: isSubmitting, error: submitError }] = useCreateFeedbackOnCommunityContextMutation({
    onError: handleError,
    onCompleted: () => notify(t('pages.feedback.success'), 'success'),
  });

  const onFeedbackSubmit = async (data: FeedbackDataEntry[]) => {
    await createFeedback({
      variables: {
        feedbackData: {
          communityID: communityId,
          questions: data.map(
            x =>
              ({
                name: x.question,
                value: x.answer,
                sortOrder: x.sortOrder,
              } as CreateNvpInput)
          ),
        },
      },
    });

    navigate(-1);
  };

  const templates = templateQuery?.configuration?.template?.challenges?.[0]?.feedback ?? [];

  const error = templateError ?? submitError;

  return <>{children({ templates }, { loading, error, isSubmitting, submitError }, { onFeedbackSubmit })}</>;
};
export default CommunityFeedbackContainer;
