import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { Checkbox, DialogContent, FormControlLabel, Link } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import { Formik } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { DEFAULT_TAGSET } from '@/domain/common/tags/tagset.constants';
import { SpaceLevel, Tagset, TagsetType } from '@/core/apollo/generated/graphql-schema';
import * as yup from 'yup';
import { nameSegmentSchema } from '@/domain/platform/admin/components/Common/NameSegment';
import { contextSegmentSchema } from '@/domain/platform/admin/components/Common/ContextSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platform/admin/components/Common/TagsetSegment';
import { SpaceEditFormValuesType } from '../spaceEditForm/SpaceEditForm';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { Actions } from '@/core/ui/actions/Actions';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { gutters } from '@/core/ui/grid/utils';
import { useUserContext } from '@/domain/community/user';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { Navigate } from 'react-router-dom';
import NameIdField from '@/core/utils/nameId/NameIdField';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import RouterLink from '@/core/ui/link/RouterLink';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useCreateSpaceMutation } from '@/core/apollo/generated/apollo-hooks';
import useNavigate from '@/core/routing/useNavigate';
import { TagCategoryValues, info, error as logError } from '@/core/logging/sentry/log';
import { compact } from 'lodash';
import { useNotification } from '@/core/ui/notifications/useNotification';
import Gutters from '@/core/ui/grid/Gutters';
import { addSpaceWelcomeCache } from '@/domain/journey/space/createSpace/utils';
import { useSpacePlans } from '@/domain/journey/space/createSpace/useSpacePlans';
import { LoadingButton } from '@mui/lab';
import { useDashboardSpaces } from '@/main/topLevelPages/myDashboard/DashboardWithMemberships/DashboardSpaces/useDashboardSpaces';

interface FormValues extends SpaceEditFormValuesType {
  licensePlanId: string;
}

type CreateSpaceDialogProps = {
  account?:
    | {
        id: string | undefined;
        name: string | undefined;
      }
    | undefined;
  withRedirectOnClose?: boolean;
  onClose?: () => void;
};

const CreateSpaceDialog = ({ withRedirectOnClose = true, onClose, account }: CreateSpaceDialogProps) => {
  const redirectToHome = useBackToStaticPath(ROUTE_HOME);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotification();

  // State
  const [dialogOpen, setDialogOpen] = useState(true);
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [addTutorialCallouts, setAddTutorialCallouts] = useState(true);

  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);

  const config = useConfig();
  const { isAuthenticated } = useAuthenticationContext();

  const { accountId: currentUserAccountId } = useUserContext();

  // either the account is passed in or we pick it up from the user context
  const accountId = account?.id ?? currentUserAccountId;

  const { availablePlans } = useSpacePlans({ skip: !dialogOpen, accountId });
  const { refetchSpaces } = useDashboardSpaces();

  const handleClose = () => {
    if (creatingLoading) {
      // do not allow stopping the creation process
      return;
    }

    setDialogOpen(false);
    setCreatingLoading(false);
    onClose?.();
    withRedirectOnClose && redirectToHome();
  };

  const tagsets = useMemo(() => {
    return [
      {
        id: '',
        name: DEFAULT_TAGSET,
        tags: [],
        allowedValues: [],
        type: TagsetType.Freeform,
      },
    ] as Tagset[];
  }, []);

  const initialValues: Partial<FormValues> = {
    name: '',
    nameID: '',
    tagline: '',
    tagsets,
    licensePlanId: '',
  };

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.name ?? yup.string(),
    nameID: nameSegmentSchema.fields?.nameID ?? yup.string(),
    tagline: contextSegmentSchema.fields?.tagline ?? yup.string(),
    tagsets: tagsetsSegmentSchema,
  });

  const [CreateNewSpace] = useCreateSpaceMutation();
  const [handleSubmit] = useLoadingState(async (values: Partial<FormValues>) => {
    if (!accountId) {
      return;
    }

    const planId = availablePlans[0]?.id;

    if (!planId) {
      logError(`No available plans on Space Creation. Account: ${accountId}`, {
        category: TagCategoryValues.UI,
        label: 'SpaceCreationError',
      });
      notify('No Available Plans. Please, contact support.', 'warning');
      return;
    }

    setCreatingLoading(true);
    const { data: newSpace } = await CreateNewSpace({
      variables: {
        spaceData: {
          accountID: accountId,
          nameID: values.nameID,
          profileData: {
            displayName: values.name!, // ensured by yup validation
            tagline: values.tagline!,
          },
          collaborationData: {
            calloutsSetData: {},
            addCallouts: !addTutorialCallouts,
            addTutorialCallouts,
          },
          tags: compact(values.tagsets?.reduce((acc: string[], tagset) => [...acc, ...tagset.tags], [])),
          licensePlanID: planId,
        },
      },
      refetchQueries: ['AccountInformation'],
      onCompleted: () => {
        refetchSpaces();
      },
      onError: () => {
        setCreatingLoading(false);
      },
    });

    const spaceID = newSpace?.createSpace.id;
    if (spaceID) {
      addSpaceWelcomeCache(spaceID);
      setCreatingLoading(false);
      setDialogOpen(false);
      info(`Space Created SpaceId:${spaceID}`, {
        category: TagCategoryValues.SPACE_CREATION,
        label: 'Space Created',
      });
      notify(t('pages.admin.space.notifications.space-created'), 'success');

      const spaceUrl = newSpace?.createSpace.profile.url;
      if (spaceUrl) {
        navigate(spaceUrl);
        return;
      }
    }
  });

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_HOME} replace />;
  }

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, errors }) => {
          return (
            <DialogWithGrid open={dialogOpen} columns={12} onClose={handleClose}>
              <DialogHeader title={t('createSpace.title')} onClose={handleClose} />
              <DialogContent sx={{ paddingTop: 0, marginTop: -1 }}>
                <PageContentBlockSeamless sx={{ paddingX: 0, paddingBottom: 0 }}>
                  <FormikInputField
                    name="name"
                    title={t('components.nameSegment.name')}
                    required
                    disabled={creatingLoading}
                  />
                  <NameIdField name="nameID" title={t('common.url')} required disabled={creatingLoading} />
                  <FormikInputField
                    name="tagline"
                    title={`${t(`context.${SpaceLevel.L0}.tagline.title` as const)} (${t('common.optional')})`}
                    rows={3}
                    maxLength={SMALL_TEXT_LENGTH}
                    disabled={creatingLoading}
                  />
                  <TagsetSegment
                    disabled={creatingLoading}
                    title={`${t('common.tags')} (${t('common.optional')})`}
                    tagsets={tagsets}
                  />

                  <Gutters disableGap disablePadding>
                    <FormControlLabel
                      checked={addTutorialCallouts}
                      disabled={creatingLoading}
                      onChange={(_event, isChecked) => setAddTutorialCallouts(isChecked)}
                      control={<Checkbox />}
                      label={<Caption>{t('createSpace.addTutorialsLabel')}</Caption>}
                    />

                    <FormControlLabel
                      value={hasAcceptedTerms}
                      disabled={creatingLoading}
                      onChange={(event, isChecked) => setHasAcceptedTerms(isChecked)}
                      required
                      control={<Checkbox />}
                      label={
                        <Caption>
                          <Trans
                            i18nKey="createSpace.terms.checkboxLabel"
                            components={{
                              terms: (
                                <Link
                                  underline="always"
                                  onClick={event => {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    setIsTermsDialogOpen(true);
                                  }}
                                />
                              ),
                            }}
                          />
                        </Caption>
                      }
                    />
                  </Gutters>

                  <DialogFooter>
                    <Actions justifyContent="end" padding={gutters()}>
                      <LoadingButton
                        variant="contained"
                        loading={creatingLoading}
                        onClick={() => handleSubmit()}
                        disabled={Object.keys(errors).length > 0 || !hasAcceptedTerms || creatingLoading}
                      >
                        {t('buttons.create')}
                      </LoadingButton>
                    </Actions>
                  </DialogFooter>
                </PageContentBlockSeamless>
              </DialogContent>
            </DialogWithGrid>
          );
        }}
      </Formik>
      <DialogWithGrid columns={8} open={isTermsDialogOpen} onClose={() => setIsTermsDialogOpen(false)}>
        <DialogHeader title={t('createSpace.terms.dialogTitle')} onClose={() => setIsTermsDialogOpen(false)} />
        <DialogContent sx={{ paddingTop: 0 }}>
          <WrapperMarkdown caption>{t('createSpace.terms.dialogContent')}</WrapperMarkdown>
          {config.locations?.terms && (
            <RouterLink to={config.locations?.terms ?? ''} blank underline="always">
              <Caption>{t('createSpace.terms.fullTermsLink')}</Caption>
            </RouterLink>
          )}
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};

export default CreateSpaceDialog;
