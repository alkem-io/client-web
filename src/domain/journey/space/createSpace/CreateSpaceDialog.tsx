import DialogWithGrid, { DialogFooter } from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { useBackToStaticPath } from '../../../../core/routing/useBackToPath';
import { ROUTE_HOME } from '../../../platform/routes/constants';
import { Checkbox, DialogContent, FormControlLabel, Link, TextField } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import { Formik } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import React, { useMemo, useState } from 'react';
import { DEFAULT_TAGSET } from '../../../common/tags/tagset.constants';
import { Tagset, TagsetType } from '../../../../core/apollo/generated/graphql-schema';
import * as yup from 'yup';
import { nameSegmentSchema } from '../../../platform/admin/components/Common/NameSegment';
import { contextSegmentSchema } from '../../../platform/admin/components/Common/ContextSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../../../platform/admin/components/Common/TagsetSegment';
import { SpaceEditFormValuesType } from '../spaceEditForm/SpaceEditForm';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { Actions } from '../../../../core/ui/actions/Actions';
import SaveButton from '../../../../core/ui/actions/SaveButton';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { gutters } from '../../../../core/ui/grid/utils';
import { useUserContext } from '../../../community/user';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { Navigate } from 'react-router-dom';
import NameIdField from '../../../../core/utils/nameId/NameIdField';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { useConfig } from '../../../platform/config/useConfig';

const CreateSpaceDialog = () => {
  const handleClose = useBackToStaticPath(ROUTE_HOME);

  const { t } = useTranslation();

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

  const initialValues: Partial<SpaceEditFormValuesType> = {
    name: '',
    nameID: '',
    tagline: '',
    tagsets,
    hostId: '',
  };

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.name ?? yup.string(),
    nameID: nameSegmentSchema.fields?.nameID ?? yup.string(),
    tagline: contextSegmentSchema.fields?.tagline ?? yup.string(),
    tagsets: tagsetSegmentSchema,
  });

  const [onSubmit, loading] = useLoadingState((_values: Partial<SpaceEditFormValuesType>) => Promise.resolve());

  const { isAuthenticated } = useAuthenticationContext();

  const { user } = useUserContext();

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);

  const config = useConfig();

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_HOME} replace />;
  }

  return (
    <>
      <DialogWithGrid open columns={12} onClose={handleClose}>
        <DialogHeader title={t('createSpace.title')} onClose={handleClose} />
        <DialogContent sx={{ paddingTop: 0, marginTop: -1 }}>
          <PageContentBlockSeamless disablePadding>
            <Caption>{t('createSpace.subtitle')}</Caption>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              enableReinitialize
              onSubmit={onSubmit}
            >
              {({ handleSubmit }) => {
                return (
                  <>
                    <FormikInputField name="name" title={t('components.nameSegment.name')} required />
                    <NameIdField name="nameID" title={t('common.url')} required />
                    <TextField value={user?.user.profile.displayName} disabled />
                    <FormikInputField
                      name="tagline"
                      title={t('context.space.tagline.title')}
                      rows={3}
                      maxLength={SMALL_TEXT_LENGTH}
                    />
                    <TagsetSegment title={t('common.tags')} tagsets={tagsets} />
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
                    <DialogFooter>
                      <Actions justifyContent="end" padding={gutters()}>
                        <SaveButton onClick={handleSubmit} loading={loading} />
                      </Actions>
                    </DialogFooter>
                  </>
                );
              }}
            </Formik>
          </PageContentBlockSeamless>
        </DialogContent>
      </DialogWithGrid>
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
