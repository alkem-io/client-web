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
import { OrganizationInputModel } from '@/domain/community/organization/model/OrganizationInputModel';
import { Button } from '@mui/material';
import { Form, Formik } from 'formik';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { NameSegment, nameSegmentSchema } from '../Common/NameSegment';
import { OrganizationSegment, organizationSegmentSchema } from '../Common/OrganizationSegment';
import ProfileReferenceSegment from '../Common/ProfileReferenceSegment';
import { ProfileSegment, profileSegmentSchema } from '../Common/ProfileSegment';
import { TagsetSegment } from '../Common/TagsetSegment';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContent from '@/core/ui/content/PageContent';
import { gutters } from '@/core/ui/grid/utils';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { TagsetModel, UpdateTagsetModel } from '@/domain/common/tagset/TagsetModel';
import { EmptyOrganizationModel, OrganizationModel } from '@/domain/community/organization/model/OrganizationModel';
import { EmptyProfileModel } from '@/domain/common/profile/ProfileModel';
import {
  mapProfileModelToCreateProfileInput,
  mapProfileModelToUpdateProfileInput,
} from '@/domain/common/profile/ProfileModelUtils';

interface Props {
  organization?: OrganizationModel;
  editMode?: EditMode;
  onSave?: (organization: CreateOrganizationInput | UpdateOrganizationInput) => void;
}

export const OrganizationForm: FC<Props> = ({
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

  const initialValues: OrganizationInputModel = {
    profile: profile ?? EmptyProfileModel,
    nameID: nameID || '',
    contactEmail: contactEmail || EmptyOrganizationModel.contactEmail,
    domain: domain || EmptyOrganizationModel.domain || '',
    legalEntityName: legalEntityName || EmptyOrganizationModel.legalEntityName || '',
    website: website || EmptyOrganizationModel.website || '',
    verified: verificationStatus,
  };

  const validationSchema = yup.object().shape({
    profile: profileSegmentSchema,
    nameID: nameSegmentSchema.fields?.nameID || yup.string(),
    contactEmail: organizationSegmentSchema.fields?.contactEmail || yup.string(),
    domain: organizationSegmentSchema.fields?.domain || yup.string(),
    legalEntityName: organizationSegmentSchema.fields?.legalEntityName || yup.string(),
    website: organizationSegmentSchema.fields?.website || yup.string(),
    verified: organizationSegmentSchema.fields?.verified || yup.string(),
  });

  /**
   * @handleSubmit
   * @param orgData instance of OrganizationModel
   * @return void
   * @summary if edits current organization data or creates a new one depending on the edit mode
   */
  const handleSubmit = useCallback(
    (orgData: OrganizationInputModel) => {
      const { profile, ...otherData } = orgData;

      if (isCreateMode) {
        const organization: CreateOrganizationInput = {
          ...otherData,
          profileData: mapProfileModelToCreateProfileInput(profile),
        };

        onSave?.(organization);
      }

      if (isEditMode) {
        const organization: UpdateOrganizationInput = {
          ID: currentOrganization.id,
          ...otherData,
          profileData: mapProfileModelToUpdateProfileInput(profile),
        };

        onSave?.(organization);
      }
    },
    [isCreateMode, isEditMode, onSave, currentOrganization.id, getUpdatedTagsets]
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
          onSubmit={handleSubmit}
        >
          {({ values: { profile }, handleSubmit }) => {
            const tagsets = profile.tagsets || [];
            const references = profile.references || [];
            const displayName = profile.displayName || '';
            const visual = profile.visuals?.find(visual => visual?.type === VisualType.Avatar);
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
                      <NameSegment disabled={isEditMode} required={!isEditMode} />
                      {!isCreateMode && (
                        <>
                          <ProfileSegment disabled={isReadOnlyMode} />
                          <OrganizationSegment disabled={isReadOnlyMode} />
                          <LocationSegment
                            disabled={isReadOnlyMode}
                            cityFieldName="location.city"
                            countryFieldName="location.country"
                          />

                          <TagsetSegment tagsets={tagsets} readOnly={isReadOnlyMode} />
                          {isEditMode && (
                            <ProfileReferenceSegment
                              references={references}
                              readOnly={isReadOnlyMode}
                              profileId={profile.id}
                            />
                          )}
                        </>
                      )}
                      {!isReadOnlyMode && (
                        <Actions justifyContent="end">
                          {backButton}
                          <Button variant="contained" type="submit">
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
