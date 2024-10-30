import { Form, Formik } from 'formik';
import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '../../../../../core/routing/useNavigate';
import * as yup from 'yup';
import { Grid } from '@mui/material';
import { Tagset, UpdateTagset } from '../../../../common/profile/Profile';
import {
  Organization,
  OrganizationVerificationEnum,
  UpdateOrganizationInput,
  CreateOrganizationInput,
  TagsetType,
} from '../../../../../core/apollo/generated/graphql-schema';
import { EditMode } from '../../../../../core/ui/forms/editMode';
import WrapperButton from '../../../../../core/ui/button/deprecated/WrapperButton';
import Section, { Header } from '../../../../../core/ui/content/deprecated/Section';
import VisualUpload from '../../../../../core/ui/upload/VisualUpload/VisualUpload';
import ProfileReferenceSegment from '../Common/ProfileReferenceSegment';
import { referenceSegmentSchema } from '../Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '../Common/TagsetSegment';
import { ProfileSegment, profileSegmentSchema } from '../Common/ProfileSegment';
import { organizationSegmentSchema, OrganizationSegment } from '../Common/OrganizationSegment';
import { NameSegment, nameSegmentSchema } from '../Common/NameSegment';
import { OrganizationInput } from '../../../../community/contributor/organization/OrganizationInput';
import { formatLocation } from '../../../../common/location/LocationUtils';
import { LocationSegment } from '../../../../common/location/LocationSegment';
import { EmptyLocation } from '../../../../common/location/Location';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { OrgVerificationLifecycleEvents } from '../../../../community/contributor/organization/adminOrganizations/useAdminGlobalOrganizationsList';

const EmptyOrganization: Omit<Organization, 'authorization' | 'agent'> = {
  id: '',
  nameID: '',
  contactEmail: undefined,
  domain: '',
  legalEntityName: '',
  website: '',
  verification: {
    id: '',
    lifecycle: {
      id: '',
    },
    nextEvents: [],
    state: '',
    status: OrganizationVerificationEnum.NotVerified,
    isFinalized: false,
    nextEvents: [OrgVerificationLifecycleEvents.VERIFICATION_REQUEST],
    state: 'notVerified',
  },
  account: undefined,
  profile: {
    id: '',
    displayName: '',
    tagline: '',
    visuals: [],
    description: '',
    url: '',
    tagsets: undefined,
    references: [],
    location: {
      id: '',
      city: '',
      country: '',
      addressLine1: '',
      addressLine2: '',
      stateOrProvince: '',
      postalCode: '',
    },
    storageBucket: {
      id: '',
      allowedMimeTypes: [],
      documents: [],
      maxFileSize: -1,
      size: -1,
    },
  },
  preferences: [],
};

interface Props {
  organization?: Organization;
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
    verification: { status: verificationStatus },
    profile: { id: profileId, displayName, description, tagline, references, tagsets, visual, location },
  } = currentOrganization;

  const getUpdatedTagsets = useCallback(
    (updatedTagsets: Tagset[]) => {
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
    nameID: nameID || EmptyOrganization.nameID,
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
    verified: verificationStatus || EmptyOrganization.verification.status,
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
    <Grid item>
      <WrapperButton
        variant={editMode ? 'default' : 'primary'}
        onClick={handleBack}
        text={t(`buttons.${editMode ? 'cancel' : 'back'}` as const)}
      />
    </Grid>
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
                <Section
                  avatar={
                    <VisualUpload
                      visual={visual}
                      altText={t('visuals-alt-text.avatar.contributor.text', {
                        displayName,
                        altText: visual?.alternativeText,
                      })}
                    />
                  }
                >
                  <Header text={title} />
                  <Gutters disablePadding>
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
                      <Grid container item justifyContent={'flex-end'} spacing={2}>
                        {backButton}
                        <Grid item>
                          <WrapperButton variant="primary" type={'submit'} text={t('buttons.save')} />
                        </Grid>
                      </Grid>
                    )}
                  </Gutters>
                </Section>
              </Form>
            );
          }}
        </Formik>
      </>
    );
  }
};

export default OrganizationForm;
