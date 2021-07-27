import React, { FC, useMemo, useState } from 'react';
import { Container, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PageProps } from './common';
import Typography from '../components/core/Typography';
import Button from '../components/core/Button';
import { Loading } from '../components/core/Loading';
import { refetchUserApplicationsQuery, useCreateApplicationMutation } from '../hooks/generated/graphql';
import ErrorBlock from '../components/core/ErrorBlock';
import { Required } from '../components/Required';
import { createStyles } from '../hooks/useTheme';
import { useUserContext } from '../hooks';
import { useApolloErrorHandler } from '../hooks';
import { CreateNvpInput, QuestionTemplate } from '../models/graphql-schema';
import { useUpdateNavigation } from '../hooks';
import Image from '../components/core/Image';

const useStyles = createStyles(theme => ({
  thankYouDiv: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.shape.spacing(1),
    marginTop: theme.shape.spacing(2),
  },
  logoDiv: {
    display: 'flex',
    gap: theme.shape.spacing(2),
    justifyContent: 'center',
    alignItems: 'center',

    '& > img': {
      height: theme.shape.spacing(4),
    },
  },
}));

interface ApplyPageProps extends PageProps {
  loading: boolean;
  error: boolean;
  communityId: string;
  communityName: string;
  tagline: string;
  avatar: string;
  questions: QuestionTemplate[];
  backUrl: string;
}

const ApplyPage: FC<ApplyPageProps> = ({
  paths,
  communityId,
  communityName,
  questions,
  tagline,
  avatar,
  loading,
  error,
  backUrl,
}): React.ReactElement => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'apply', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { t } = useTranslation();
  const styles = useStyles();
  const handleError = useApolloErrorHandler();

  const { user } = useUserContext();
  const userId = user?.user.id || '';

  const [hasApplied, setHasApplied] = useState(false);

  const [createApplication, { loading: isCreationLoading }] = useCreateApplicationMutation({
    onCompleted: () => setHasApplied(true),
    // refetch user applications
    refetchQueries: [refetchUserApplicationsQuery({ input: { userID: userId } })],
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
          userID: userId,
          parentID: communityId,
          questions: questionsAndAnswers,
        },
      },
    });
  };

  return (
    <Container>
      {error && <ErrorBlock blockName={t('pages.ecoverse.application.errorBlockName')} />}
      {loading && <Loading text={t('pages.ecoverse.application.loading')} />}
      {!loading && !hasApplied && (
        <>
          <Typography variant={'h2'} className={'mt-4 mb-4'}>
            {t('pages.ecoverse.application.title')}
            {communityName}
          </Typography>
        </>
      )}
      {!loading && (
        <div className={styles.logoDiv}>
          {avatar && <Image src={avatar} alt="Alkemio" />}
          {!hasApplied && <span>{tagline}</span>}
        </div>
      )}
      {!loading && !hasApplied && (
        <Typography variant={'h3'} className={'mt-5 mb-5'}>
          {t('pages.ecoverse.application.subheader')}
        </Typography>
      )}
      {hasApplied ? (
        <div className={styles.thankYouDiv}>
          <Typography variant={'h3'}>
            {t('pages.ecoverse.application.finish')}
            {communityName}
          </Typography>
          <Button as={Link} to={backUrl}>
            {t('pages.ecoverse.application.backButton')}
          </Button>
        </div>
      ) : (
        <>
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
      )}
    </Container>
  );
};

export default ApplyPage;
