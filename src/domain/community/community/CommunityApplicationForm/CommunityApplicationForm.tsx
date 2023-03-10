import { FC, useMemo } from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { max, pullAt, slice, sortBy } from 'lodash';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import {
  refetchCommunityApplicationFormQuery,
  useCommunityApplicationFormQuery,
  useUpdateCommunityApplicationQuestionsMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import FormIntroductionField from './views/FormIntroductionField';
import FormQuestionField, { questionSchema } from './views/FormQuestionField';
import FormikSubmitButton from '../../../shared/components/forms/FormikSubmitButton';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import Gutters from '../../../../core/ui/grid/Gutters';

interface CommunityApplicationFormProps {
  hubId: string;
  challengeId?: string;
  disabled?: boolean;
}

interface FormValues {
  description: string;
  questions: {
    question: string;
    required: boolean;
    sortOrder: number;
  }[];
}

const validationSchema = yup.object().shape({
  description: yup.string().required(),
  questions: yup.array().of(questionSchema),
});

// Returns a new question object with a sortOrder calculated from the other questions
const newQuestion = (currentQuestions: FormValues['questions']) => ({
  question: '',
  required: false,
  sortOrder: (max(currentQuestions.map(q => q.sortOrder)) ?? 0) + 1,
});

const CommunityApplicationForm: FC<CommunityApplicationFormProps> = ({ hubId, challengeId, disabled }) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const isHub = !Boolean(challengeId);

  const { data: rawData, loading: loadingQuestions } = useCommunityApplicationFormQuery({
    variables: {
      hubId,
      challengeId: challengeId,
      isHub: isHub,
      isChallenge: !isHub,
    },
    skip: !hubId && !challengeId,
  });

  const data = useMemo(
    () => ({
      communityId: isHub ? rawData?.hub.community?.id : rawData?.hub.challenge?.community?.id,
      description: isHub
        ? rawData?.hub.community?.applicationForm?.description
        : rawData?.hub.challenge?.community?.applicationForm?.description,
      questions: sortBy(
        isHub
          ? rawData?.hub.community?.applicationForm?.questions
          : rawData?.hub.challenge?.community?.applicationForm?.questions,
        q => q.sortOrder
      ),
    }),
    [isHub, rawData]
  );

  const [updateQuestions, { loading: submittingQuestions }] = useUpdateCommunityApplicationQuestionsMutation();

  const loading = loadingQuestions || submittingQuestions;
  const initialValues: FormValues = {
    description: data.description ?? '',
    questions: data.questions ?? [],
  };

  const onSubmit = (values: FormValues) => {
    // Recompute sortOrder and add missing properties before submitting:
    const questions = values.questions.map((q, index) => ({
      ...q,
      sortOrder: index + 1,
      explanation: '',
      maxLength: 500, // Server defaults to 500
    }));

    updateQuestions({
      variables: {
        communityId: data.communityId!,
        formData: {
          description: values.description,
          questions,
        },
      },
      onCompleted: () => notify(t('community.application-form.updated-successfully'), 'success'),
      awaitRefetchQueries: true,
      refetchQueries: [
        refetchCommunityApplicationFormQuery({
          hubId,
          challengeId: challengeId,
          isHub: isHub,
          isChallenge: !isHub,
        }),
      ],
    });
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
      {({ values: { questions }, setFieldValue, handleSubmit }) => {
        const handleAdd = () => {
          const newArray = [...questions, newQuestion(questions)];
          setFieldValue('questions', newArray);
        };
        const handleDelete = (index: number) => {
          const nextQuestions = [...questions];
          pullAt(nextQuestions, index);
          setFieldValue('questions', nextQuestions);
        };
        const handleMoveUp = (index: number) => {
          if (index === 0) return;
          // Change sorting in the array and swap sortOrder properties
          const previousElement = { ...questions[index - 1], sortOrder: questions[index].sortOrder };
          const element = { ...questions[index], sortOrder: questions[index - 1].sortOrder };
          const nextQuestions = [
            ...slice(questions, 0, index - 1),
            element,
            previousElement,
            ...slice(questions, index + 1),
          ];
          setFieldValue('questions', nextQuestions);
        };

        const handleMoveDown = (index: number) => {
          if (index >= questions.length - 1) return;
          handleMoveUp(index + 1);
        };

        return (
          <>
            <FormIntroductionField disabled={disabled || loading} />
            <Gutters />
            <BlockSectionTitle>
              {t('common.questions')}
              <Tooltip title={'Add question'} placement={'bottom'}>
                <span>
                  <IconButton
                    aria-label="Add"
                    onClick={() => {
                      handleAdd();
                    }}
                    color="primary"
                    disabled={disabled || loading}
                    size="large"
                  >
                    <AddIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </BlockSectionTitle>
            {questions.map((question, index) => (
              <FormQuestionField
                key={index}
                index={index}
                onDelete={() => handleDelete(index)}
                disabled={disabled || loading}
                canMoveUp={index > 0}
                onMoveUpClick={() => handleMoveUp(index)}
                canMoveDown={index < questions.length - 1}
                onMoveDownClick={() => handleMoveDown(index)}
              />
            ))}
            <Box display="flex" marginY={4} justifyContent="flex-end">
              <FormikSubmitButton variant="contained" onClick={() => handleSubmit()} loading={loading}>
                {t('common.update')}
              </FormikSubmitButton>
            </Box>
          </>
        );
      }}
    </Formik>
  );
};

export default CommunityApplicationForm;
