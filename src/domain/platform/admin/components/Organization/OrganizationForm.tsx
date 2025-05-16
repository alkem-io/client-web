import {
  CreateOrganizationInput,
  OrganizationVerificationEnum,
  TagsetType,
  UpdateOrganizationInput,
} from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { EditMode } from '@/core/ui/forms/editMode';
import Gutters from '@/core/ui/grid/Gutters';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import { EmptyLocation } from '@/domain/common/location/LocationModel';
import { LocationSegment } from '@/domain/common/location/LocationSegment';
import { formatLocation } from '@/domain/common/location/LocationUtils';
import { UpdateTagset } from '@/domain/common/profile/Profile';
import { OrganizationInput } from '@/domain/community/organization/model/OrganizationInput';
import { OrgVerificationLifecycleEvents } from '@/domain/platform/admin/organizations/useAdminGlobalOrganizationsList';
import { Button } from '@mui/material';
import { Form, Formik } from 'formik';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { NameSegment, nameSegmentSchema } from '../Common/NameSegment';
import { OrganizationSegment, organizationSegmentSchema } from '../Common/OrganizationSegment';
import ProfileReferenceSegment from '../Common/ProfileReferenceSegment';
import { ProfileSegment, profileSegmentSchema } from '../Common/ProfileSegment';
import { referenceSegmentSchema } from '../Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '../Common/TagsetSegment';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContent from '@/core/ui/content/PageContent';
import { gutters } from '@/core/ui/grid/utils';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { EmptyOrganization, OrganizationModel } from '@/domain/community/organization/model/OrganizationModel';

interface Props {
  organization?: OrganizationModel;
  editMode?: EditMode;
  onSave?: (organization: CreateOrganizationInput | UpdateOrganizationInput) => void;
  title?: string;
}

export const OrganizationForm: FC<Props> = ({
  organization: currentOrganization = EmptyOrganization,
  editMode = EditMode.readOnly,
  onSave,
  title = 'Organization',
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isCreateMode = editMode === EditMode.new;
  const isEditMode = editMode === EditMode.edit;
  const isReadOnlyMode = editMode === EditMode.readOnly;

  const {
    nameID,
    contactEmail,
    domain,
    legalEntityName,
    website,
    profile: { id: profileId, displayName, description, tagline, references, tagsets, visuals, location },
  } = currentOrganization;

  const verificationStatus = currentOrganization.verification?.status || OrganizationVerificationEnum.NotVerified;
  const getUpdatedTagsets = useCallback(
    (updatedTagsets: TagsetModel[]) => {
      const result: UpdateTagset[] = [];
      updatedTagsets.forEach(updatedTagset => {
        const originalTagset = tagsets?.find(value => value.name === updatedTagset.name);
        if (originalTagset) result.push({ ...originalTagset, tags: updatedTagset.tags });
      });

      return result;
    },
    [tagsets]
  );

  const initialValues: OrganizationInput = {
    name: displayName || EmptyOrganization.profile.displayName,
    nameID: nameID || '',
    description: description || EmptyOrganization.profile.description || '',
    tagline: tagline || EmptyOrganization.profile.tagline || '',
    location: {
      ...EmptyLocation,
      ...formatLocation(location),
    },
    tagsets: tagsets ?? [],
    contactEmail: contactEmail || EmptyOrganization.contactEmail,
    domain: domain || EmptyOrganization.domain || '',
    legalEntityName: legalEntityName || EmptyOrganization.legalEntityName || '',
    website: website || EmptyOrganization.website || '',
    verified: verificationStatus,
    references: references || EmptyOrganization.profile.references || [],
  };

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.name || yup.string(),
    nameID: nameSegmentSchema.fields?.nameID || yup.string(),
    description: profileSegmentSchema.fields?.description || yup.string(),
    contactEmail: organizationSegmentSchema.fields?.contactEmail || yup.string(),
    domain: organizationSegmentSchema.fields?.domain || yup.string(),
    legalEntityName: organizationSegmentSchema.fields?.legalEntityName || yup.string(),
    website: organizationSegmentSchema.fields?.website || yup.string(),
    verified: organizationSegmentSchema.fields?.verified || yup.string(),
    tagsets: tagsetsSegmentSchema,
    references: referenceSegmentSchema,
  });

  /**
   * @handleSubmit
   * @param orgData instance of OrganizationModel
   * @return void
   * @summary if edits current organization data or creates a new one depending on the edit mode
   */
  const handleSubmit = useCallback(
    (orgData: OrganizationInput) => {
      const { tagsets, references, description, tagline, location, ...otherData } = orgData;

      if (isCreateMode) {
        const organization: CreateOrganizationInput = {
          ...otherData,
          profileData: {
            description,
            tagline,
            displayName: otherData.name!, // ensured by yup
            referencesData: references,
            location: {
              city: location.city,
              country: location.country?.code,
            },
          },
        };

        onSave?.(organization);
      }

      if (isEditMode) {
        const updatedTagsets = getUpdatedTagsets(tagsets);
        const organization: UpdateOrganizationInput = {
          ID: currentOrganization.id,
          ...otherData,
          profileData: {
            displayName: otherData.name,
            description,
            tagline,
            references: references.map(r => ({ ...r, ID: r.id, id: undefined })),
            tagsets: updatedTagsets.map(r => ({
              ...r,
              ID: r.id,
              id: undefined,
              allowedValues: [],
              type: TagsetType.Freeform,
              tags: r.tags ?? [],
            })),
            location: {
              city: location.city,
              country: location.country?.code,
            },
          },
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
          {({ values: { references, tagsets }, handleSubmit }) => {
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
                      <PageContentBlockHeader title={title} />
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
                              profileId={profileId}
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
