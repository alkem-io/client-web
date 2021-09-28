import { Box, Container, Grid } from '@material-ui/core';
import { Formik } from 'formik';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import FormikInputField from '../components/Admin/Common/FormikInputField';
import Button from '../components/core/Button';
import ErrorBlock from '../components/core/ErrorBlock';
import Image from '../components/core/Image';
import { Loading } from '../components/core/Loading/Loading';
import Typography from '../components/core/Typography';
import { useApolloErrorHandler, useUpdateNavigation, useUserContext } from '../hooks';
import { refetchUserApplicationsQuery, useCreateApplicationMutation } from '../hooks/generated/graphql';
import { createStyles } from '../hooks/useTheme';
import { CreateNvpInput, QuestionTemplate } from '../models/graphql-schema';
import { PageProps } from './common';

const useStyles = createStyles(theme => ({
  thankYouDiv: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  logoDiv: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    alignItems: 'center',

    '& > img': {
      height: theme.spacing(4),
    },
  },
}));

export type ApplyPageType = 'ecoverse' | 'challenge';

interface ApplyPageProps extends PageProps {
  loading: boolean;
  error: boolean;
  communityId: string;
  communityName: string;
  tagline: string;
  avatar: string;
  questions: QuestionTemplate[];
  backUrl: string;
  type: ApplyPageType;
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
  type,
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
    <Container maxWidth="xl">
      {error && <ErrorBlock blockName={t('pages.ecoverse.application.errorBlockName')} />}
      {loading && <Loading text={t('pages.ecoverse.application.loading')} />}
      {!loading && !hasApplied && (
        <Box marginY={4}>
          <Typography variant={'h2'}>
            {t('pages.ecoverse.application.title', { name: communityName, entity: type })}
          </Typography>
        </Box>
      )}
      {!loading && (
        <div className={styles.logoDiv}>
          {avatar && <Image src={avatar} alt="Alkemio" />}
          {!hasApplied && <span>{tagline}</span>}
        </div>
      )}
      {!loading && !hasApplied && (
        <Box marginY={5}>
          <Typography variant={'h3'}>{t('pages.ecoverse.application.subheader')}</Typography>
        </Box>
      )}
      {hasApplied ? (
        <div className={styles.thankYouDiv}>
          <Typography variant={'h3'}>
            {t('pages.ecoverse.application.finish')}
            {communityName}
          </Typography>
          <Button as={Link} to={backUrl} text={t('pages.ecoverse.application.backButton')} />
        </div>
      ) : (
        <>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            onSubmit={async values => onSubmit(values)}
          >
            {({ handleSubmit }) => {
              return (
                <>
                  <Grid container spacing={2}>
                    {questions.map((x, i) => (
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
                    ))}
                    <Grid item>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isCreationLoading}
                        onClick={() => handleSubmit()}
                        text={t(`buttons.${isCreationLoading ? 'processing' : 'apply'}` as const)}
                      />
                    </Grid>
                  </Grid>
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
