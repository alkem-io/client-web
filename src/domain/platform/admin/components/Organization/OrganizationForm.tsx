import { Form, Formik } from 'formik';
import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { Grid } from '@mui/material';
import { useTagsetsTemplateQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { Tagset, UpdateTagset } from '../../../../common/profile/Profile';
import {
  Organization,
  OrganizationVerificationEnum,
  TagsetTemplate,
  UpdateOrganizationInput,
  CreateOrganizationInput,
} from '../../../../../core/apollo/generated/graphql-schema';
import { EditMode } from '../../../../../core/ui/forms/editMode';
import WrapperButton from '../../../../../common/components/core/WrapperButton';
import Section, { Header } from '../../../../../common/components/core/Section';
import VisualUpload from '../../../../../common/components/composite/common/VisualUpload/VisualUpload';
import ProfileReferenceSegment from '../Common/ProfileReferenceSegment';
import { referenceSegmentSchema } from '../Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../Common/TagsetSegment';
import { ProfileSegment, profileSegmentSchema } from '../Common/ProfileSegment';
import { organizationSegmentSchema, OrganizationSegment } from '../Common/OrganizationSegment';
import { NameSegment, nameSegmentSchema } from '../Common/NameSegment';
import { OrganizationInput } from '../../../../community/contributor/organization/OrganizationInput';
import { formatLocation } from '../../../../common/location/LocationUtils';
import { LocationSegment } from '../../../../common/location/LocationSegment';
import { EmptyLocation } from '../../../../common/location/Location';

const EmptyOrganization: Omit<Organization, 'authorization'> = {
  id: '',
  nameID: '',
  displayName: '',
  contactEmail: undefined,
  domain: '',
  legalEntityName: '',
  website: '',
  verification: {
    id: '',
    status: OrganizationVerificationEnum.NotVerified,
    lifecycle: {
      id: '',
      stateIsFinal: false,
      machineDef: '',
    },
  },
  profile: {
    id: '',
    description: '',
    tagsets: undefined,
    references: [],
    location: {
      id: '',
      city: '',
      country: '',
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
  const { data: config } = useTagsetsTemplateQuery();

  useEffect(() => {}, [config]);

  const isCreateMode = editMode === EditMode.new;
  const isEditMode = editMode === EditMode.edit;
  const isReadOnlyMode = editMode === EditMode.readOnly;

  const {
    displayName,
    nameID,
    contactEmail,
    domain,
    legalEntityName,
    website,
    verification: { status: verificationStatus },
    profile: { id: profileId, description, references, tagsets, avatar, location },
  } = currentOrganization;

  const tagsetsTemplate: TagsetTemplate[] = useMemo(() => {
    if (config) return config.configuration.template.organizations[0].tagsets || [];
    return [];
  }, [config]);

  const defaultEmptyTagsets = useMemo(() => {
    return tagsetsTemplate.map(cur => ({ name: cur.name, tags: [] }));
  }, [tagsetsTemplate]);

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
    name: displayName || EmptyOrganization.displayName,
    nameID: nameID || EmptyOrganization.nameID,
    description: description || EmptyOrganization.profile.description || '',
    location: {
      ...EmptyLocation,
      ...formatLocation(location),
    },
    tagsets: tagsets || defaultEmptyTagsets,
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
    tagsets: tagsetSegmentSchema,
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
      const { tagsets, references, description, location, ...otherData } = orgData;

      if (isCreateMode) {
        const organization: CreateOrganizationInput = {
          ...otherData,
          displayName: otherData.name!, // ensured by yup
          profileData: {
            description,
            referencesData: references,
            tagsetsData: tagsets,
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
          displayName: otherData.name,
          profileData: {
            ID: currentOrganization.profile.id,
            description,
            references: references.map(r => ({ ...r, ID: r.id, id: undefined })),
            tagsets: updatedTagsets.map(r => ({ ...r, ID: r.id, id: undefined })),
            location: {
              city: location.city,
              country: location.country?.code,
            },
          },
        };

        onSave?.(organization);
      }
    },
    [isCreateMode, isEditMode, onSave, currentOrganization.id, currentOrganization.profile.id, getUpdatedTagsets]
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
                <Section avatar={<VisualUpload visual={avatar} />}>
                  <Header text={title} />
                  <Grid container spacing={2}>
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
                  </Grid>
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
