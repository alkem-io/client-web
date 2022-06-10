import { Form, Formik } from 'formik';
import React, { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { Grid } from '@mui/material';
import { useTagsetsTemplateQuery } from '../../../hooks/generated/graphql';
import { Tagset, UpdateTagset } from '../../../models/Profile';
import {
  Organization,
  OrganizationVerificationEnum,
  TagsetTemplate,
  UpdateOrganizationInput,
  CreateOrganizationInput,
} from '../../../models/graphql-schema';
import { EditMode } from '../../../models/editMode';
import Button from '../../core/Button';
import Section, { Header } from '../../core/Section';
import VisualUpload from '../../composite/common/VisualUpload/VisualUpload';
import ProfileReferenceSegment from '../Common/ProfileReferenceSegment';
import { referenceSegmentSchema } from '../Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../Common/TagsetSegment';
import { ProfileSegment, profileSegmentSchema } from '../Common/ProfileSegment';
import { organizationSegmentSchema, OrganizationSegment } from '../Common/OrganizationSegment';
import { NameSegment, nameSegmentSchema } from '../Common/NameSegment';
import { OrganizationInput } from '../../../domain/organization/OrganizationInput';
import { formatLocation } from '../../../domain/location/LocationUtils';
import { LocationSegment } from '../../../domain/location/LocationSegment';
import { EmptyLocation } from '../../../domain/location/Location';

const EmptyOrganization: Organization = {
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

  const getUpdatedTagsets = (updatedTagsets: Tagset[]) => {
    const result: UpdateTagset[] = [];
    updatedTagsets.forEach(updatedTagset => {
      const originalTagset = tagsets?.find(value => value.name === updatedTagset.name);
      if (originalTagset) result.push({ ...originalTagset, tags: updatedTagset.tags });
    });

    return result;
  };

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
  const handleSubmit = async (orgData: OrganizationInput) => {
    const { tagsets, references, description, location, ...otherData } = orgData;

    if (isCreateMode) {
      const organization: CreateOrganizationInput = {
        ...otherData,
        displayName: otherData.name,
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

      onSave && onSave(organization);
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

      onSave && onSave(organization);
    }
  };

  const handleBack = () => navigate(-1);

  const backButton = (
    <Grid item>
      <Button
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
          onSubmit={values => handleSubmit(values)}
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
                          <Button variant="primary" type={'submit'} text={t('buttons.save')} />
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
