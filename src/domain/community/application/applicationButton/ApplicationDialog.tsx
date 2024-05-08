import { Formik } from 'formik';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { useApplicationCommunityQuery } from '../containers/useApplicationCommunityQuery';
import {
  refetchUserProviderQuery,
  useApplyForCommunityMembershipMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { CreateNvpInput } from '../../../../core/apollo/generated/graphql-schema';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { BlockTitle } from '../../../../core/ui/typography';
import Gutters from '../../../../core/ui/grid/Gutters';
import References from '../../../shared/components/References/References';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { DialogContent } from '@mui/material';
import { gutters } from '../../../../core/ui/grid/utils';
import { Actions } from '../../../../core/ui/actions/Actions';
import { LoadingButton } from '@mui/lab';
import FormikEffectFactory from '../../../../core/ui/forms/FormikEffect';

const FormikEffect = FormikEffectFactory<Record<string, string>>();

interface ApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  journeyId: string | undefined;
  canJoinCommunity?: boolean;
  onJoin: () => void;
  onApply?: () => void;
}

const ApplicationDialog: FC<ApplicationDialogProps> = ({
  open,
  journeyId,
  onJoin,
  onClose,
  onApply,
  canJoinCommunity = false,
}) => {
  const { t } = useTranslation();
  const [applicationQuestions, setApplicationQuestions] = useState<CreateNvpInput[]>([]);
  const [isValid, setIsValid] = useState(false);

  const { data } = useApplicationCommunityQuery(journeyId, canJoinCommunity);
  const { description, questions = [], communityId = '', displayName: communityName, communityGuidelines } = data || {};

  const [createApplication, { loading: isCreationLoading }] = useApplyForCommunityMembershipMutation({
    // refetch user applications
    refetchQueries: [refetchUserProviderQuery()],
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

  const onStatusChange = (isValid: boolean) => setIsValid(isValid);

  const handleChange = (values: Record<string, string>) => {
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
    setApplicationQuestions(questionArrayInput);
  };

  const onSubmit = async () => {
    if (canJoinCommunity) {
      onJoin();
      onClose();
      return;
    }

    await createApplication({
      variables: {
        input: {
          communityID: communityId,
          questions: applicationQuestions,
        },
      },
    });
    onClose();
    onApply?.();
  };

  const dialogTitle = canJoinCommunity
    ? t('pages.space.application.joinTitle', { name: communityName })
    : t('pages.space.application.applyTitle', { name: communityName });

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={8}>
      <DialogHeader onClose={onClose} title={dialogTitle} />
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          validateOnMount
          onSubmit={() => {}}
        >
          {() => {
            return (
              <>
                <Gutters disablePadding>
                  <FormikEffect onChange={handleChange} onStatusChange={onStatusChange} />
                  {canJoinCommunity && <BlockTitle>{t('pages.space.application.subheaderJoin')}</BlockTitle>}
                  {!canJoinCommunity &&
                    (description ? (
                      <WrapperMarkdown>{description}</WrapperMarkdown>
                    ) : (
                      <BlockTitle> {t('pages.space.application.subheader')}</BlockTitle>
                    ))}
                  {questions.map((x, i) => (
                    <FormikInputField
                      key={i}
                      title={x.question}
                      name={`['${x.question}']`}
                      rows={2}
                      multiline
                      required={x.required}
                      autoComplete="on"
                      autoCapitalize="sentences"
                      autoCorrect="on"
                      maxLength={x.maxLength}
                    />
                  ))}
                  {communityGuidelines && (
                    <>
                      <BlockTitle>{communityGuidelines.displayName}</BlockTitle>
                      <WrapperMarkdown>{communityGuidelines.description ?? ''}</WrapperMarkdown>
                      <References compact references={communityGuidelines.references} />
                    </>
                  )}
                </Gutters>
              </>
            );
          }}
        </Formik>
      </DialogContent>
      <Actions padding={gutters()} justifyContent="end">
        <LoadingButton
          loading={isCreationLoading}
          loadingIndicator={`${t('buttons.processing')}...`}
          onClick={() => onSubmit()}
          variant="contained"
          disabled={!isValid}
        >
          {canJoinCommunity ? t('components.application-button.join') : t('buttons.apply')}
        </LoadingButton>
      </Actions>
    </DialogWithGrid>
  );
};

export default ApplicationDialog;
