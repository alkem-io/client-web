import { FC, useMemo } from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import {
  refetchCommunityGuidelinesQuery,
  useCommunityGuidelinesQuery,
  useUpdateCommunityGuidelinesMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import FormikSubmitButton from '../../../shared/components/forms/FormikSubmitButton';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import Gutters from '../../../../core/ui/grid/Gutters';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { Tagset, TagsetType } from '../../../../core/apollo/generated/graphql-schema';
import { DEFAULT_TAGSET } from '../../../common/tags/tagset.constants';

interface CommunityGuidelinesProps {
  spaceId: string;
  challengeId?: string;
  disabled?: boolean;
}

interface FormValues {
  displayName: string;
  description: string;
}

const validationSchema = yup.object().shape({
  title: yup.string().required(),
  description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
});

const CommunityGuidelines: FC<CommunityGuidelinesProps> = ({ spaceId, challengeId, disabled }) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const isSpace = !Boolean(challengeId);

  const { data: rawData, loading: loadingGuidelines } = useCommunityGuidelinesQuery({
    variables: {
      spaceId,
    },
    skip: !spaceId,
  });

  const data = useMemo(
    () => ({
      communityGuidelinesId: rawData?.space?.community?.guidelines?.id,
      title: rawData?.space?.community?.guidelines?.profile.displayName,
      description: rawData?.space?.community?.guidelines?.profile.description,
      references: rawData?.space?.community?.guidelines?.profile.references,
      tagset: rawData?.space?.community?.guidelines?.profile.tagset
        ? [rawData?.space?.community?.guidelines?.profile.tagset]
        : ([
            {
              id: '',
              name: DEFAULT_TAGSET,
              tags: [],
              allowedValues: [],
              type: TagsetType.Freeform,
            },
          ] as Tagset[]),
    }),
    [rawData]
  );

  const [updateGuidelines, { loading: submittingGuidelines }] = useUpdateCommunityGuidelinesMutation();

  const loading = loadingGuidelines || submittingGuidelines;
  const initialValues: FormValues = {
    displayName: data.title ?? '',
    description: data.description ?? '',
  };

  const onSubmit = (values: FormValues) => {
    updateGuidelines({
      variables: {
        communityGuidelinesData: {
          communityGuidelinesID: data.communityGuidelinesId ?? '',
          profile: {
            displayName: values.displayName,
            description: values.description,
          },
        },
      },
      onCompleted: () => notify(t('community.communityGuidelines.updatedSuccessfully'), 'success'),
      awaitRefetchQueries: true,
      refetchQueries: [
        refetchCommunityGuidelinesQuery({
          spaceId,
        }),
      ],
    });
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
      {({ values, setFieldValue, handleSubmit }) => {
        return (
          <>
            <FormikInputField name="displayName" title={t('common.title')} placeholder={t('common.title')} />
            <FormikMarkdownField
              title={t('common.introduction')}
              name="description"
              disabled={disabled || loading}
              maxLength={MARKDOWN_TEXT_LENGTH}
            />
            <Gutters />

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

export default CommunityGuidelines;
