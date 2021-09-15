import { Form, Formik } from 'formik';
import React, { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { Grid } from '@material-ui/core';
import { useTagsetsTemplateQuery } from '../../../hooks/generated/graphql';
import { Tagset } from '../../../models/Profile';
import { Organisation, OrganizationVerificationEnum, TagsetTemplate } from '../../../models/graphql-schema';
import { EditMode } from '../../../utils/editMode';
import Button from '../../core/Button';
import Section, { Header } from '../../core/Section';
import EditableAvatar from '../../EditableAvatar';
import ProfileReferenceSegment from '../Common/ProfileReferenceSegment';
import { referenceSegmentSchema } from '../Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../Common/TagsetSegment';
import { ProfileSegment, profileSegmentSchema } from '../Common/ProfileSegment';
import { organisationegmentSchema, OrganisationSegment } from '../Common/OrganisationSegment';
import { NameSegment } from '../Common/NameSegment';

const emptyOrganization = {
  nameID: '',
  displayName: '',
  contactEmail: '',
  domain: '',
  legalEntityName: '',
  website: '',
  verified: OrganizationVerificationEnum.NotVerified,
  profile: {
    description: '',
    avatar: '',
    tagsets: [],
    references: [],
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
  const history = useHistory();
  const { t } = useTranslation();
  const { data: config } = useTagsetsTemplateQuery({});

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
    verified,
    profile: { id: profileId, description, references, avatar },
  } = currentOrganization as Organisation;

  const tagsetsTemplate: TagsetTemplate[] = useMemo(() => {
    if (config) return config.configuration.template.users[0].tagsets || [];
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

  const initialValues = {
    name: displayName || emptyOrganization.displayName,
    nameID: nameID || emptyOrganization.nameID,
    description: description || emptyOrganization.profile.description,
    avatar: avatar || emptyOrganization.profile.avatar,
    tagsets: tagsets || emptyOrganization.profile.tagsets,
    contactEmail: contactEmail || emptyOrganization.contactEmail,
    domain: domain || emptyOrganization.domain,
    legalEntityName: legalEntityName || emptyOrganization.legalEntityName,
    website: website || emptyOrganization.website,
    verified: verified || emptyOrganization.verified,
    references: references || emptyOrganization.profile.references,
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(t('forms.validations.required')),
    nameID: yup.string().required(t('forms.validations.required')),
    avatar: profileSegmentSchema.fields?.avatar || yup.string(),
    description: profileSegmentSchema.fields?.description || yup.string(),
    contactEmail: organisationegmentSchema.fields?.contactEmail || yup.string(),
    domain: organisationegmentSchema.fields?.domain || yup.string(),
    legalEntityName: organisationegmentSchema.fields?.legalEntityName || yup.string(),
    website: organisationegmentSchema.fields?.website || yup.string(),
    verified: organisationegmentSchema.fields?.verified || yup.string(),
    tagsets: tagsetSegmentSchema,
    references: referenceSegmentSchema,
  });

  /**
   * @handleSubmit
   * @param orgData instance of OrganisationModel
   * @return void
   * @summary if edits current organization data or creates a new one depending on the edit mode
   */
  const handleSubmit = async (orgData: typeof initialValues) => {
    const { tagsets, avatar, references, description, ...otherData } = orgData;

    const organization: Organisation = {
      ...currentOrganization,
      ...otherData,
      displayName: otherData.name,
      profile: {
        description,
        avatar,
        references,
        tagsets,
      },
    };

    onSave && onSave(organization);
  };

  const handleBack = () => history.goBack();

  const backButton = (
    <Grid item>
      <Button
        variant={editMode ? 'default' : 'primary'}
        onClick={handleBack}
        text={t(`buttons.${editMode ? 'cancel' : 'back'}`)}
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
          {({ values: { references, tagsets, avatar }, handleSubmit }) => {
            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Section avatar={<EditableAvatar src={avatar} size={'xl'} name={'Avatar'} profileId={profileId} />}>
                  <Header text={title} />
                  <Grid container spacing={2}>
                    <NameSegment disabled={isEditMode} required={!isEditMode} />

                    {!isCreateMode && (
                      <>
                        <ProfileSegment disabled={isReadOnlyMode} />

                        <OrganisationSegment disabled={isReadOnlyMode} />

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
