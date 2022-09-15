import React, { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import * as yup from 'yup';
import { Formik } from 'formik';
import { Grid, Button } from '@mui/material';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import FormikInputField from '../../../common/components/composite/forms/FormikInputField';
import ErrorBlock from '../../../common/components/core/ErrorBlock';
import { FeedbackDataEntry } from '../../../containers/context/feedback/CommunityFeedbackContainer';
import { QuestionTemplate } from '../../../models/graphql-schema';
import { ViewProps } from '../../../models/view';
import SectionSpacer from '../../shared/components/Section/SectionSpacer';

export interface CommunityFeedbackViewEntities {
  questions: Omit<QuestionTemplate, '__typename'>[];
}

export interface CommunityFeedbackViewActions {
  onSubmit: (data: FeedbackDataEntry[]) => void;
}

export interface CommunityFeedbackViewOptions {}

export interface CommunityFeedbackViewState {
  loading: boolean;
  error?: ApolloError;
  isSubmitting: boolean;
  submitError?: ApolloError;
}

export interface CommunityFeedbackViewProps
  extends ViewProps<
    CommunityFeedbackViewEntities,
    CommunityFeedbackViewActions,
    CommunityFeedbackViewState,
    CommunityFeedbackViewOptions
  > {}

const CommunityFeedbackView: FC<CommunityFeedbackViewProps> = ({ entities, actions, state }) => {
  const { t } = useTranslation();
  const { questions } = entities;
  const { onSubmit } = actions;
  const { isSubmitting, error, loading } = state;

  const initialValues: Record<string, string> = useMemo(
    () => questions.reduce((acc, val) => ({ ...acc, [val.question]: '' }), {} as Record<string, string>),
    [questions]
  );

  const validationSchema: yup.ObjectSchema = useMemo(
    () =>
      questions.reduce(
        (acc, val) =>
          acc.shape({
            [val.question]: val.required ? yup.string().required(t('forms.validations.required')) : yup.string(),
          }),
        yup.object()
      ),
    [questions]
  );

  const innerOnSubmit = useCallback(
    (values: Record<string, string> /* <question, answer> */) => {
      const feedback: FeedbackDataEntry[] = [];

      for (const questionText in values) {
        const question = questions.find(x => x.question === questionText);
        const sortOrder = question?.sortOrder ?? 0; // sort order defaults to 0

        feedback.push({
          question: questionText,
          answer: values[questionText],
          sortOrder,
        });
      }

      onSubmit(feedback);
    },
    [questions, onSubmit]
  );

  const questionFields = useMemo(() => {
    return [...questions]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((x, i) => (
        <Grid item key={i} xs={12}>
          <FormikInputField
            key={i}
            title={x.question}
            name={`['${x.question}']`} // Formik can work with nested objects. Avoid nesting when a question contains dot.- https://formik.org/docs/guides/arrays#avoid-nesting
            rows={2}
            multiline
            required={x.required}
            autoComplete="on"
            autoCapitalize="sentences"
            autoCorrect="on"
          />
        </Grid>
      ));
  }, [questions]);

  return (
    <>
      <Typography sx={{ display: 'flex', justifyContent: 'center' }}>{t('pages.feedback.title')}</Typography>
      <SectionSpacer double />
      {error && <ErrorBlock blockName={t('common.questions')} />}
      {loading ? (
        <>
          <Skeleton width="100%" />
          <Skeleton width="100%" />
        </>
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => innerOnSubmit(values)}
        >
          {({ handleSubmit }) => (
            <Grid container spacing={2}>
              {questionFields}
              <Grid item display="flex" flexGrow={1} justifyContent="end">
                <Button variant="contained" type="submit" disabled={isSubmitting} onClick={() => handleSubmit()}>
                  {t(`buttons.${isSubmitting ? 'processing' : 'submit'}` as const)}
                </Button>
              </Grid>
            </Grid>
          )}
        </Formik>
      )}
    </>
  );
};
export default CommunityFeedbackView;
