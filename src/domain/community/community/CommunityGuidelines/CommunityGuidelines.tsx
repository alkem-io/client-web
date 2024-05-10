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
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import Gutters from '../../../../core/ui/grid/Gutters';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { Reference } from '../../../../core/apollo/generated/graphql-schema';
import { referenceSegmentSchema } from '../../../platform/admin/components/Common/ReferenceSegment';
import LoadingButton from '@mui/lab/LoadingButton';
import ProfileReferenceSegment from '../../../platform/admin/components/Common/ProfileReferenceSegment';

interface CommunityGuidelinesProps {
  communityId: string;
  challengeId?: string;
  disabled?: boolean;
}

interface FormValues {
  displayName: string;
  description: string;
  references: Reference[];
}

const validationSchema = yup.object().shape({
  displayName: yup.string().required(),
  description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  references: referenceSegmentSchema,
});

const CommunityGuidelines: FC<CommunityGuidelinesProps> = ({ communityId, disabled }) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const { data: rawData, loading: loadingGuidelines } = useCommunityGuidelinesQuery({
    variables: {
      communityId,
    },
    skip: !communityId,
  });

  const data = useMemo(
    () => ({
      communityGuidelinesId: rawData?.lookup?.community?.guidelines?.id,
      displayName: rawData?.lookup?.community?.guidelines?.profile.displayName,
      description: rawData?.lookup?.community?.guidelines?.profile.description,
      profile: rawData?.lookup?.community?.guidelines?.profile,
      references: rawData?.lookup?.community?.guidelines?.profile.references,
    }),
    [rawData]
  );

  const [updateGuidelines, { loading: submittingGuidelines }] = useUpdateCommunityGuidelinesMutation();

  const loading = loadingGuidelines || submittingGuidelines;
  const initialValues: FormValues = {
    displayName: data.displayName ?? '',
    description: data.description ?? '',
    references: data.references || [],
  };

  const onSubmit = (values: FormValues) => {
    updateGuidelines({
      variables: {
        communityGuidelinesData: {
          communityGuidelinesID: data.communityGuidelinesId ?? '',
          profile: {
            displayName: values.displayName,
            description: values.description,
            references: values.references.map(reference => ({
              ID: reference.id,
              name: reference.name,
              description: reference.description,
              uri: reference.uri,
            })),
          },
        },
      },
      onCompleted: () => notify(t('community.communityGuidelines.updatedSuccessfully'), 'success'),
      awaitRefetchQueries: true,
      refetchQueries: [
        refetchCommunityGuidelinesQuery({
          communityId,
        }),
      ],
    });
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
      {({ values, handleSubmit, isValid }) => {
        console.log(values);
        return (
          <Gutters>
            <FormikInputField name="displayName" title={t('common.title')} placeholder={t('common.title')} />
            <FormikMarkdownField
              title={t('common.introduction')}
              name="description"
              disabled={disabled || loading}
              maxLength={MARKDOWN_TEXT_LENGTH}
            />
            <ProfileReferenceSegment references={values.references} profileId={data?.profile?.id} />
            <Box display="flex" marginY={4} justifyContent="flex-end">
              <LoadingButton disabled={!isValid} variant="contained" onClick={() => handleSubmit()} loading={loading}>
                {t('common.update')}
              </LoadingButton>
            </Box>
          </Gutters>
        );
      }}
    </Formik>
  );
};

export default CommunityGuidelines;
