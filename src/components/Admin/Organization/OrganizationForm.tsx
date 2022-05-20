import { Form, Formik } from 'formik';
import React, { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { Grid } from '@mui/material';
import { useTagsetsTemplateQuery } from '../../../hooks/generated/graphql';
import { Tagset } from '../../../models/Profile';
import { Organization, OrganizationVerificationEnum, TagsetTemplate } from '../../../models/graphql-schema';
import { EditMode } from '../../../models/editMode';
import Button from '../../core/Button';
import Section, { Header } from '../../core/Section';
import VisualUpload from '../../composite/common/VisualUpload/VisualUpload';
import ProfileReferenceSegment from '../Common/ProfileReferenceSegment';
import { referenceSegmentSchema } from '../Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../Common/TagsetSegment';
import { ProfileSegment, profileSegmentSchema } from '../Common/ProfileSegment';
import { organizationegmentSchema, OrganizationSegment } from '../Common/OrganizationSegment';
import { NameSegment, nameSegmentSchema } from '../Common/NameSegment';
import { OrganizationInput } from '../../../domain/organization/OrganizationInput';
import { formatLocation } from '../../../domain/location/LocationUtils';
import { LocationSegment } from '../../../domain/location/LocationSegment';
import { EmptyLocation } from '../../../domain/location/Location';

const emptyOrganization = {
  nameID: '',
  displayName: '',
  contactEmail: '',
  domain: '',
  legalEntityName: '',
  website: '',
  verification: {
    status: OrganizationVerificationEnum.NotVerified,
  },
  profile: {
    description: '',
    tagsets: [],
    references: [],
    location: EmptyLocation,
  },
};

interface Props {
  organization?: any;
  editMode?: EditMode;
  onSave?: (organization) => void;
  onAvatarChange?;
  title?: string;
}

export const OrganizationForm: FC<Props> = ({
  organization: currentOrganization = emptyOrganization,
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
    profile: { id: profileId, description, references, avatar, location },
  } = currentOrganization as Organization;

  const tagsetsTemplate: TagsetTemplate[] = useMemo(() => {
    if (config) return config.configuration.template.organizations[0].tagsets || [];
    return [];
  }, [config]);

  const tagsets = useMemo(() => {
    let {
      profile: { tagsets },
    } = currentOrganization;
    return tagsetsTemplate.reduce(
      (acc, cur) => {
        if (acc.every(x => x.name.toLowerCase() !== cur.name.toLowerCase())) {
          acc.push({ name: cur.name, tags: [] });
        }
        return acc;
      },
      [...(tagsets as Tagset[])]
    );
  }, [currentOrganization, tagsetsTemplate]);

  const initialValues: OrganizationInput = {
    name: displayName || emptyOrganization.displayName,
    nameID: nameID || emptyOrganization.nameID,
    description: description || emptyOrganization.profile.description,
    location: {
      ...emptyOrganization.profile.location,
      ...formatLocation(location),
    },
    tagsets: tagsets || emptyOrganization.profile.tagsets,
    contactEmail: contactEmail || emptyOrganization.contactEmail,
    domain: domain || emptyOrganization.domain,
    legalEntityName: legalEntityName || emptyOrganization.legalEntityName,
    website: website || emptyOrganization.website,
    verified: verificationStatus || emptyOrganization.verification.status,
    references: references || emptyOrganization.profile.references,
  };

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.name || yup.string(),
    nameID: nameSegmentSchema.fields?.nameID || yup.string(),
    description: profileSegmentSchema.fields?.description || yup.string(),
    contactEmail: organizationegmentSchema.fields?.contactEmail || yup.string(),
    domain: organizationegmentSchema.fields?.domain || yup.string(),
    legalEntityName: organizationegmentSchema.fields?.legalEntityName || yup.string(),
    website: organizationegmentSchema.fields?.website || yup.string(),
    verified: organizationegmentSchema.fields?.verified || yup.string(),
    tagsets: tagsetSegmentSchema,
    references: referenceSegmentSchema,
  });

  /**
   * @handleSubmit
   * @param orgData instance of OrganizationModel
   * @return void
   * @summary if edits current organization data or creates a new one depending on the edit mode
   */
  const handleSubmit = async (orgData: typeof initialValues) => {
    const { tagsets, references, description, location, ...otherData } = orgData;

    const organization: Organization = {
      ...currentOrganization,
      ...otherData,
      displayName: otherData.name,
      profile: {
        description,
        references,
        tagsets,
        location: {
          city: location.city,
          country: location.country?.code,
        },
      },
    };

    onSave && onSave(organization);
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
