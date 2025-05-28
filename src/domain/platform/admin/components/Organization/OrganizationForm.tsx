import {
  CreateOrganizationInput,
  OrganizationVerificationEnum,
  UpdateOrganizationInput,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { EditMode } from '@/core/ui/forms/editMode';
import Gutters from '@/core/ui/grid/Gutters';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import { LocationSegment } from '@/domain/common/location/LocationSegment';
import { Button } from '@mui/material';
import { Form, Formik } from 'formik';
import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { NameSegment, nameSegmentSchema } from '../Common/NameSegment';
import { OrganizationSegment, organizationSegmentSchema } from '../Common/OrganizationSegment';
import ProfileReferenceSegment from '../Common/ProfileReferenceSegment';
import { ProfileSegment, profileSegmentSchemaWithReferences } from '../Common/ProfileSegment';
import { TagsetSegment } from '../Common/TagsetSegment';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContent from '@/core/ui/content/PageContent';
import { gutters } from '@/core/ui/grid/utils';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { TagsetModel, UpdateTagsetModel } from '@/domain/common/tagset/TagsetModel';
import { EmptyOrganizationModel, OrganizationModel } from '@/domain/community/organization/model/OrganizationModel';
import { EmptyProfileModel, ProfileModelFull } from '@/domain/common/profile/ProfileModel';
import {
  mapProfileModelToCreateProfileInput,
  mapProfileModelToUpdateProfileInput,
} from '@/domain/common/profile/ProfileModelUtils';
import { getVisualByType } from '@/domain/common/visual/utils/visuals.utils';
import SocialSegment from '@/domain/platform/admin/components/Common/SocialSegment';
import { socialNames, SocialNetworkEnum } from '@/domain/shared/components/SocialLinks/models/SocialNetworks';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';

interface OrganizationFormValues {
  nameID: string;
  profile: ProfileModelFull;
  contactEmail: string | undefined;
  domain: string | undefined;
  legalEntityName: string | undefined;
  website: string | undefined;
  verified: OrganizationVerificationEnum;
  linkedin: string | undefined;
  bsky: string | undefined;
  github: string | undefined;
}

interface OrganizationFormProps {
  organization?: OrganizationModel;
  editMode?: EditMode;
  onSave?: (organization: CreateOrganizationInput | UpdateOrganizationInput) => Promise<unknown>;
}

export const OrganizationForm: FC<OrganizationFormProps> = ({
  organization: currentOrganization = EmptyOrganizationModel,
  editMode = EditMode.readOnly,
  onSave,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isCreateMode = editMode === EditMode.new;
  const isEditMode = editMode === EditMode.edit;
  const isReadOnlyMode = editMode === EditMode.readOnly;

  const { nameID, contactEmail, domain, legalEntityName, website, profile } = currentOrganization;

  const verificationStatus = currentOrganization.verification?.status || OrganizationVerificationEnum.NotVerified;
  const getUpdatedTagsets = useCallback(
    (updatedTagsets: TagsetModel[]) => {
      const result: UpdateTagsetModel[] = [];
      updatedTagsets.forEach(updatedTagset => {
        const originalTagset = profile.tagsets?.find(value => value.name === updatedTagset.name);
        if (originalTagset) result.push({ ...originalTagset, tags: updatedTagset.tags });
      });

      return result;
    },
    [profile.tagsets]
  );

  const { blueSkyRef, githubRef, linkedinRef } = useMemo(
    () => ({
      blueSkyRef: profile.references?.find(x => x.name.toLowerCase() === SocialNetworkEnum.bsky),
      githubRef: profile.references?.find(x => x.name.toLowerCase() === SocialNetworkEnum.github),
      linkedinRef: profile.references?.find(x => x.name.toLowerCase() === SocialNetworkEnum.linkedin),
    }),
    [profile.references]
  );

  const initialValues: OrganizationFormValues = {
    profile: {
      ...(profile ?? EmptyProfileModel),
      references: profile.references?.filter(x => !socialNames.includes(x.name.toLowerCase())) ?? [],
    },
    nameID: nameID || '',
    contactEmail: contactEmail || EmptyOrganizationModel.contactEmail,
    domain: domain || EmptyOrganizationModel.domain || '',
    legalEntityName: legalEntityName || EmptyOrganizationModel.legalEntityName || '',
    website: website || EmptyOrganizationModel.website || '',
    verified: verificationStatus,
    linkedin: linkedinRef?.uri || '',
    bsky: blueSkyRef?.uri || '',
    github: githubRef?.uri || '',
  };

  const validationSchema = yup.object().shape({
    profile: profileSegmentSchemaWithReferences,
    nameID: nameSegmentSchema.fields?.nameID || yup.string(),
    contactEmail: organizationSegmentSchema.fields?.contactEmail || yup.string(),
    domain: organizationSegmentSchema.fields?.domain || yup.string(),
    legalEntityName: organizationSegmentSchema.fields?.legalEntityName || yup.string(),
    website: organizationSegmentSchema.fields?.website || yup.string(),
    verified: organizationSegmentSchema.fields?.verified || yup.string(),
    linkedin: yup
      .string()
      .url(t('forms.validations.elementMustBeValidUrl', { name: t('components.profileSegment.socialLinks.linkedin') })),
    bsky: yup
      .string()
      .url(t('forms.validations.elementMustBeValidUrl', { name: t('components.profileSegment.socialLinks.bsky') })),
    github: yup
      .string()
      .url(t('forms.validations.elementMustBeValidUrl', { name: t('components.profileSegment.socialLinks.github') })),
  });

  /**
   * @handleSubmit
   * @param orgData instance of OrganizationModel
   * @return void
   * @summary if edits current organization data or creates a new one depending on the edit mode
   */
  const handleSubmit = useCallback(
    async (orgData: OrganizationFormValues) => {
      const { profile, ...otherData } = orgData;

      if (isCreateMode) {
        const organization: CreateOrganizationInput = {
          ...otherData,
          profileData: mapProfileModelToCreateProfileInput(profile),
        };

        onSave && (await onSave(organization));
      }

      if (isEditMode) {
        const profileData = {
          ...profile,
          references: [
            ...(profile.references ?? []),
            { ...linkedinRef, uri: orgData.linkedin } as ReferenceModel,
            { ...blueSkyRef, uri: orgData.bsky } as ReferenceModel,
            { ...githubRef, uri: orgData.github } as ReferenceModel,
          ],
        };

        const organization: UpdateOrganizationInput = {
          ID: currentOrganization.id,
          ...otherData,
          profileData: mapProfileModelToUpdateProfileInput(profileData),
        };

        onSave && (await onSave(organization));
      }
    },
    [isCreateMode, isEditMode, onSave, currentOrganization.id, getUpdatedTagsets, linkedinRef, blueSkyRef, githubRef]
  );

  const handleBack = () => navigate(-1);

  const backButton = (
    <Button variant="outlined" onClick={handleBack}>
      {t(`buttons.${isEditMode ? 'cancel' : 'back'}`)}
    </Button>
  );

  if (!currentOrganization && editMode !== EditMode.new) {
    return (
      <>
        <div>Organization not found!</div>
        {backButton}
      </>
    );
  } else {
    return (
      <>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await handleSubmit(values);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values: { profile }, handleSubmit, isSubmitting }) => {
            const tagsets = profile.tagsets || [];
            const displayName = profile.displayName || '';
            const visual = getVisualByType(VisualType.Avatar, profile.visuals);

            return (
              <Form noValidate onSubmit={handleSubmit}>
                <PageContent background="transparent" gridContainerProps={{ gap: gutters(2) }}>
                  <PageContentColumn columns={4} justifyContent="end">
                    <VisualUpload
                      visual={visual}
                      altText={t('visuals-alt-text.avatar.contributor.text', {
                        displayName,
                        altText: visual?.alternativeText,
                      })}
                    />
                  </PageContentColumn>
                  <PageContentColumn columns={6}>
                    <Gutters disablePadding>
                      <PageContentBlockHeader title={t('common.organization')} />
                      <NameSegment
                        disabled={isEditMode}
                        required={!isEditMode}
                        nameFieldName="profile.displayName"
                        nameIdFieldName="nameID"
                      />
                      {!isCreateMode && (
                        <>
                          <ProfileSegment disabled={isReadOnlyMode} />
                          <OrganizationSegment disabled={isReadOnlyMode} />
                          <LocationSegment
                            disabled={isReadOnlyMode}
                            cityFieldName="profile.location.city"
                            countryFieldName="profile.location.country"
                          />

                          <TagsetSegment tagsets={tagsets} readOnly={isReadOnlyMode} disabled={isSubmitting} />

                          <SocialSegment
                            readOnly={isReadOnlyMode}
                            fieldNames={{ email: 'contactEmail' }}
                            disabled={isSubmitting}
                          />

                          {isEditMode && (
                            <ProfileReferenceSegment
                              disabled={isSubmitting}
                              fieldName="profile.references"
                              references={profile.references ?? []}
                              readOnly={isReadOnlyMode}
                              profileId={profile.id}
                            />
                          )}
                        </>
                      )}
                      {!isReadOnlyMode && (
                        <Actions justifyContent="end">
                          {!isSubmitting && backButton}
                          <Button variant="contained" type="submit" loading={isSubmitting}>
                            {t('buttons.save')}
                          </Button>
                        </Actions>
                      )}
                    </Gutters>
                  </PageContentColumn>
                </PageContent>
              </Form>
            );
          }}
        </Formik>
      </>
    );
  }
};

export default OrganizationForm;
