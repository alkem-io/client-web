import React, { FC } from 'react';
import useNavigate from '../../../../../core/routing/useNavigate';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../../../core/container/container';
import {
  useCommunityFeedbackTemplatesQuery,
  useCreateFeedbackOnCommunityContextMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { CreateNvpInput, FeedbackTemplate } from '../../../../../core/apollo/generated/graphql-schema';
import { useCommunityContext } from '../../../../community/community/CommunityContext';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
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
  const notify = useNotification();
  const { t } = useTranslation();

  const { communityId } = useCommunityContext();
  const { data: templateQuery, loading, error: templateError } = useCommunityFeedbackTemplatesQuery();
  const [createFeedback, { loading: isSubmitting, error: submitError }] = useCreateFeedbackOnCommunityContextMutation({
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

  const templates = templateQuery?.platform.configuration.template?.challenges?.[0]?.feedback ?? [];

  const error = templateError ?? submitError;

  return <>{children({ templates }, { loading, error, isSubmitting, submitError }, { onFeedbackSubmit })}</>;
};

export default CommunityFeedbackContainer;
