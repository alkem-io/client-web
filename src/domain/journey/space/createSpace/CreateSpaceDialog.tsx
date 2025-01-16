import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { Button, Checkbox, Dialog, DialogContent, FormControlLabel, Link } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import { Formik } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { DEFAULT_TAGSET } from '@/domain/common/tags/tagset.constants';
import { Tagset, TagsetType } from '@/core/apollo/generated/graphql-schema';
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
import PlansTableDialog from './plansTable/PlansTableDialog';
import { refetchDashboardWithMembershipsQuery, useCreateSpaceMutation } from '@/core/apollo/generated/apollo-hooks';
import { useSpaceUrlLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import useNavigate from '@/core/routing/useNavigate';
import Loading from '@/core/ui/loading/Loading';
import { TagCategoryValues, info } from '@/core/logging/sentry/log';
import { compact } from 'lodash';
import { useNotification } from '@/core/ui/notifications/useNotification';
import Gutters from '@/core/ui/grid/Gutters';

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
  redirectOnComplete?: boolean;
  onClose?: () => void;
};

const CreateSpaceDialog = ({ redirectOnComplete = true, onClose, account }: CreateSpaceDialogProps) => {
  const redirectToHome = useBackToStaticPath(ROUTE_HOME);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotification();
  const [dialogOpen, setDialogOpen] = useState(true);
  const [plansTableDialogOpen, setPlansTableDialogOpen] = useState(false);
  const [creatingDialogOpen, setCreatingDialogOpen] = useState(false);

  const handleClose = () => {
    setDialogOpen(false);
    setPlansTableDialogOpen(false);
    setCreatingDialogOpen(false);
    onClose?.();
    redirectOnComplete && redirectToHome();
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

  const { isAuthenticated } = useAuthenticationContext();

  const { accountId: currentUserAccountId } = useUserContext();

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [addTutorialCallouts, setAddTutorialCallouts] = useState(false);

  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);

  const config = useConfig();

  // either the account is passed in or we pick it up from the user context
  const accountId = account?.id ?? currentUserAccountId;

  const [CreateNewSpace] = useCreateSpaceMutation();
  const [getSpaceUrl] = useSpaceUrlLazyQuery();
  const [handleSubmit] = useLoadingState(async (values: Partial<FormValues>) => {
    if (!accountId) {
      return;
    }

    setDialogOpen(false);
    setPlansTableDialogOpen(false);
    setCreatingDialogOpen(true);
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
            addTutorialCallouts,
          },
          tags: compact(values.tagsets?.reduce((acc: string[], tagset) => [...acc, ...tagset.tags], [])),
          licensePlanID: values.licensePlanId,
        },
      },
      refetchQueries: ['AccountInformation', refetchDashboardWithMembershipsQuery()],
      onError: () => {
        setDialogOpen(true);
        setPlansTableDialogOpen(false);
        setCreatingDialogOpen(false);
      },
    });

    const spaceID = newSpace?.createSpace.id;
    if (spaceID) {
      setDialogOpen(false);
      setCreatingDialogOpen(false);
      info(`Space Created SpaceId:${spaceID}`, {
        category: TagCategoryValues.SPACE_CREATION,
        label: 'Space Created',
      });
      notify(t('pages.admin.space.notifications.space-created'), 'success');

      if (redirectOnComplete) {
        const { data: spaceUrlData } = await getSpaceUrl({
          variables: {
            spaceNameId: newSpace.createSpace.id,
          },
        });

        const spaceUrl = spaceUrlData?.space.profile.url;
        if (spaceUrl) {
          navigate(spaceUrl);
          return;
        }
      } else {
        handleClose();
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
        {({ setFieldValue, handleSubmit, errors }) => {
          return (
            <>
              <DialogWithGrid open={dialogOpen} columns={12} onClose={handleClose}>
                <DialogHeader title={t('createSpace.title')} onClose={handleClose} />
                <DialogContent sx={{ paddingTop: 0, marginTop: -1 }}>
                  <PageContentBlockSeamless sx={{ paddingX: 0, paddingBottom: 0 }}>
                    <FormikInputField name="name" title={t('components.nameSegment.name')} required />
                    <NameIdField name="nameID" title={t('common.url')} required />
                    <FormikInputField
                      name="tagline"
                      title={`${t('context.space.tagline.title')} (${t('common.optional')})`}
                      rows={3}
                      maxLength={SMALL_TEXT_LENGTH}
                    />
                    <TagsetSegment title={`${t('common.tags')} (${t('common.optional')})`} tagsets={tagsets} />

                    <Gutters disableGap disablePadding>
                      <FormControlLabel
                        value={addTutorialCallouts}
                        onChange={(event, isChecked) => setAddTutorialCallouts(isChecked)}
                        required
                        control={<Checkbox />}
                        label={<Caption>{t('createSpace.addTutorialsLabel')}</Caption>}
                      />

                      <FormControlLabel
                        value={hasAcceptedTerms}
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
                        <Button
                          variant="contained"
                          onClick={() => {
                            setDialogOpen(false);
                            setPlansTableDialogOpen(true);
                          }}
                          disabled={Object.keys(errors).length > 0 || !hasAcceptedTerms}
                        >
                          {t('buttons.continue')}
                        </Button>
                      </Actions>
                    </DialogFooter>
                  </PageContentBlockSeamless>
                </DialogContent>
              </DialogWithGrid>
              <PlansTableDialog
                onClose={handleClose}
                open={plansTableDialogOpen}
                onSelectPlan={licensePlanId => {
                  setFieldValue('licensePlanId', licensePlanId);
                  handleSubmit();
                }}
              />
            </>
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
      <Dialog open={creatingDialogOpen}>
        <DialogContent sx={{ display: 'flex', alignItems: 'center' }}>
          <Loading />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateSpaceDialog;
