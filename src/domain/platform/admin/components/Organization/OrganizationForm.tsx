import {
  CreateOrganizationInput,
  Organization,
  OrganizationVerificationEnum,
  TagsetType,
  UpdateOrganizationInput,
} from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import Section, { Header } from '@/core/ui/content/deprecated/Section';
import { EditMode } from '@/core/ui/forms/editMode';
import Gutters from '@/core/ui/grid/Gutters';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import { EmptyLocation } from '@/domain/common/location/Location';
import { LocationSegment } from '@/domain/common/location/LocationSegment';
import { formatLocation } from '@/domain/common/location/LocationUtils';
import { Tagset, UpdateTagset } from '@/domain/common/profile/Profile';
import { OrganizationInput } from '@/domain/community/contributor/organization/OrganizationInput';
import { OrgVerificationLifecycleEvents } from '@/domain/community/contributor/organization/adminOrganizations/useAdminGlobalOrganizationsList';
import { Button, Grid } from '@mui/material';
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
      <Button variant="outlined" onClick={handleBack}>
        {t(`buttons.${isEditMode ? 'cancel' : 'back'}`)}
      </Button>
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
                          <Button variant="outlined" type="submit">
                            {t('buttons.save')}
                          </Button>
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
