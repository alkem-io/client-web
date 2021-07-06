import React, { FC, useMemo, useState } from 'react';
import { Container, Form } from 'react-bootstrap';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PageProps } from './common';
import Typography from '../components/core/Typography';
import Button from '../components/core/Button';
import { Loading } from '../components/core/Loading';
import { useCreateApplicationMutation, useEcoverseApplicationTemplateQuery } from '../generated/graphql';
import ErrorBlock from '../components/core/ErrorBlock';
import { Required } from '../components/Required';
import { createStyles } from '../hooks/useTheme';
import { useUserContext } from '../hooks/useUserContext';
import { useApolloErrorHandler } from '../hooks/useApolloErrorHandler';
import { useEcoverse } from '../hooks/useEcoverse';
import { CreateNvpInput } from '../types/graphql-schema';
import { useUpdateNavigation } from '../hooks/useNavigation';

const useStyles = createStyles(() => ({
  thankYouDiv: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
}));

interface EcoverseApplyPageProps extends PageProps {}

const EcoverseApplyPage: FC<EcoverseApplyPageProps> = ({ paths }): React.ReactElement => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'apply', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { t } = useTranslation();
  const styles = useStyles();
  const handleError = useApolloErrorHandler();

  const { user } = useUserContext();
  const userId = user?.user.id;

  const { ecoverse } = useEcoverse();
  const communityId = ecoverse?.ecoverse.community?.id;

  const [hasApplied, setHasApplied] = useState(false);

  const { data, loading: isTemplateLoading, error } = useEcoverseApplicationTemplateQuery();
  /* todo: get applications by ecoverse and application name */
  const questions = data?.configuration.template.ecoverses[0].applications?.[0].questions || [];

  const [createApplication, { loading: isCreationLoading }] = useCreateApplicationMutation({
    onCompleted: () => {
      setHasApplied(true);
    },
    onError: handleError,
  });

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

  const onSubmit = async (values: Record<string, string> /* <question, answer> */) => {
    const questionsAndAnswers: CreateNvpInput[] = [];

    for (const answer in values) {
      questionsAndAnswers.push({
        name: answer,
        value: values[answer],
      });
    }

    await createApplication({
      variables: {
        input: {
          userID: userId || '',
          parentID: communityId || '',
          questions: questionsAndAnswers,
        },
      },
    });
  };

  return (
    <Container>
      {isTemplateLoading && <Loading text={'Loading questions ...'} />}
      {error && <ErrorBlock blockName={''} />}
      {hasApplied ? (
        <div className={styles.thankYouDiv}>
          <Typography variant={'h3'}>{'Thank you for applying'}</Typography>
        </div>
      ) : (
        questions.length > 0 && (
          <>
            <Typography variant={'h3'} className={'mt-4 mb-4'}>
              {t('pages.ecoverse.application.title')}
            </Typography>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              enableReinitialize
              onSubmit={async values => onSubmit(values)}
            >
              {({ handleSubmit, handleChange, errors }) => {
                return (
                  <>
                    {questions.map((x, i) => (
                      <Form.Group key={i}>
                        <Form.Label>
                          {x.question}
                          {x.required && <Required />}
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name={x.question}
                          required={x.required}
                          onChange={handleChange}
                          autoComplete="on"
                          autoCapitalize="sentences"
                          autoCorrect="on"
                          isInvalid={!!errors[x.question]}
                        />
                        <Form.Control.Feedback type="invalid">This is required</Form.Control.Feedback>
                      </Form.Group>
                    ))}
                    <Button variant="primary" type="submit" disabled={isCreationLoading} onClick={() => handleSubmit()}>
                      {isCreationLoading ? 'Processing...' : 'Apply'}
                    </Button>
                  </>
                );
              }}
            </Formik>
          </>
        )
      )}
    </Container>
  );
};

export default EcoverseApplyPage;
