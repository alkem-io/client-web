import { Box, Container, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Formik } from 'formik';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import WrapperButton from '../../../../common/components/core/WrapperButton';
import ErrorBlock from '../../../../common/components/core/ErrorBlock';
import Image from '../../../shared/components/Image';
import { Loading } from '../../../../common/components/core/Loading/Loading';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';
import { useApplicationCommunityQuery } from '../containers/useApplicationCommunityQuery';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';
import { useApolloErrorHandler } from '../../../../core/apollo/hooks/useApolloErrorHandler';
import { useUserContext } from '../../contributor/user';
import {
  refetchUserApplicationsQuery,
  useApplyForCommunityMembershipMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ApplicationTypeEnum } from '../constants/ApplicationType';
import { CreateNvpInput } from '../../../../core/apollo/generated/graphql-schema';
import getApplicationTypeKey from '../../../../common/utils/translation/getApplicationTypeKey';
import { PageProps } from '../../../shared/types/PageProps';

const useStyles = makeStyles(theme => ({
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

interface ApplyPageProps extends PageProps {
  type: ApplicationTypeEnum;
}

const ApplyPage: FC<ApplyPageProps> = ({ paths, type }): React.ReactElement => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'apply', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { t } = useTranslation();
  const styles = useStyles();
  const handleError = useApolloErrorHandler();

  const { user } = useUserContext();
  const userId = user?.user.id || '';

  const { data, loading, error } = useApplicationCommunityQuery(type);

  const { questions = [], communityId = '', displayName: communityName, avatar, tagline, backUrl = '' } = data || {};

  const [hasApplied, setHasApplied] = useState(false);

  const [createApplication, { loading: isCreationLoading }] = useApplyForCommunityMembershipMutation({
    onCompleted: () => setHasApplied(true),
    // refetch user applications
    refetchQueries: [refetchUserApplicationsQuery({ input: userId })],
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
    [questions, t]
  );

  const onSubmit = async (values: Record<string, string> /* <question, answer> */) => {
    const questionArrayInput: CreateNvpInput[] = [];

    for (const questionText in values) {
      const question = questions.find(x => x.question === questionText);
      const sortOrder = question?.sortOrder || 0; // sort order defaults to 0

      questionArrayInput.push({
        name: questionText,
        value: values[questionText],
        sortOrder: sortOrder,
      });
    }

    await createApplication({
      variables: {
        input: {
          communityID: communityId,
          questions: questionArrayInput,
        },
      },
    });
  };

  const entityNameKey = getApplicationTypeKey(type);

  return (
    <Container maxWidth="xl">
      {error && <ErrorBlock blockName={t('pages.hub.application.errorBlockName')} />}
      {loading && <Loading text={t('pages.hub.application.loading')} />}
      {!loading && !hasApplied && (
        <Box marginY={4}>
          <WrapperTypography variant={'h2'}>
            {t('pages.hub.application.title', { name: communityName, entity: t(entityNameKey) })}
          </WrapperTypography>
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
          <WrapperTypography variant={'h3'}>{t('pages.hub.application.subheader')}</WrapperTypography>
        </Box>
      )}
      {hasApplied ? (
        <div className={styles.thankYouDiv}>
          <WrapperTypography variant={'h3'}>
            {t('pages.hub.application.finish')}
            {communityName}
          </WrapperTypography>
          <WrapperButton as={Link} to={backUrl} text={t('pages.hub.application.backButton')} />
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
                      <WrapperButton
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
