import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Formik } from 'formik';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import WrapperButton from '../../../../common/components/core/WrapperButton';
import ErrorBlock from '../../../../common/components/core/ErrorBlock';
import { Loading } from '../../../../common/components/core/Loading/Loading';
import { useApplicationCommunityQuery } from '../containers/useApplicationCommunityQuery';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';
import { useUserContext } from '../../contributor/user';
import {
  refetchUserApplicationsQuery,
  useApplyForCommunityMembershipMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ApplicationTypeEnum } from '../constants/ApplicationType';
import { CreateNvpInput } from '../../../../core/apollo/generated/graphql-schema';
import getApplicationTypeKey from '../../../../common/utils/translation/getApplicationTypeKey';
import { PageProps } from '../../../shared/types/PageProps';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { PageTitle, BlockTitle } from '../../../../core/ui/typography';
import SaveButton from '../../../../core/ui/actions/SaveButton';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';

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

  const { user } = useUserContext();
  const userId = user?.user.id || '';

  const { data, loading, error } = useApplicationCommunityQuery(type);

  const { description, questions = [], communityId = '', displayName: communityName, backUrl = '' } = data || {};

  const [hasApplied, setHasApplied] = useState(false);

  const [createApplication, { loading: isCreationLoading }] = useApplyForCommunityMembershipMutation({
    onCompleted: () => setHasApplied(true),
    // refetch user applications
    refetchQueries: [refetchUserApplicationsQuery({ input: userId })],
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
    <PageContent>
      <PageContentBlock>
        {error && <ErrorBlock blockName={t('pages.hub.application.errorBlockName')} />}
        {loading && <Loading text={t('pages.hub.application.loading')} />}
        {!loading && !hasApplied && (
          <PageTitle>{t('pages.hub.application.title', { name: communityName, entity: t(entityNameKey) })}</PageTitle>
        )}
        {!loading &&
          !hasApplied &&
          (description ? (
            <WrapperMarkdown>{description}</WrapperMarkdown>
          ) : (
            <BlockTitle> {t('pages.hub.application.subheader')}</BlockTitle>
          ))}
        {hasApplied ? (
          <div className={styles.thankYouDiv}>
            <BlockTitle>
              {t('pages.hub.application.finish')}
              {communityName}
            </BlockTitle>
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
                            maxLength={x.maxLength}
                            withCounter
                          />
                        </Grid>
                      ))}
                      <Grid item>
                        <SaveButton type="submit" loading={isCreationLoading} onClick={() => handleSubmit()}>
                          {t(`buttons.${isCreationLoading ? 'processing' : 'apply'}` as const)}
                        </SaveButton>
                      </Grid>
                    </Grid>
                  </>
                );
              }}
            </Formik>
          </>
        )}
      </PageContentBlock>
    </PageContent>
  );
};

export default ApplyPage;
