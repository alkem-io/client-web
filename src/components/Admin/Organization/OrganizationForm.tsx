import { Formik } from 'formik';
import React, { FC, useEffect, useMemo } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { useTagsetsTemplateQuery } from '../../../hooks/generated/graphql';
import { OrganisationModel } from '../../../models/Organisation';
import { Tagset } from '../../../models/Profile';
import { Organisation, TagsetTemplate } from '../../../models/graphql-schema';
import { EditMode } from '../../../utils/editMode';
import Section, { Header } from '../../core/Section';
import EditableAvatar from '../../EditableAvatar';
import FormikInputField from '../Common/FormikInputField';
import ProfileReferenceSegment from '../Common/ProfileReferenceSegment';
import { referenceSegmentSchema } from '../Common/ReferenceSegment';
import { tagsetSegmentSchema, TagsetSegment } from '../Common/TagsetSegment';

const emptyOrganization = {
  displayName: '',
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
    profile: { id: profileId, description, references, avatar },
  } = currentOrganization;

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
    displayName: displayName || '',
    nameID: nameID || '',
    description: description || '',
    avatar: avatar || '',
    tagsets: tagsets || [],
    references: references || [],
  };

  const validationSchema = yup.object().shape({
    displayName: yup.string().required(t('forms.validations.required')),
    nameID: yup.string().required(t('forms.validations.required')),
    avatar: yup.string(),
    description: yup.string().max(400),
    tagsets: tagsetSegmentSchema,
    references: referenceSegmentSchema,
  });

  /**
   * @handleSubmit
   * @param orgData instance of OrganisationModel
   * @return void
   * @summary if edits current organization data or creates a new one depending on the edit mode
   */
  const handleSubmit = async (orgData: OrganisationModel) => {
    const { tagsets, avatar, references, description, ...otherData } = orgData;

    const organization: Organisation = {
      ...currentOrganization,
      ...otherData,
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
    <Button variant={editMode ? 'secondary' : 'primary'} onClick={handleBack}>
      {editMode ? 'Cancel' : 'Back'}
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
          onSubmit={values => handleSubmit(values)}
        >
          {({ values: { displayName, nameID, references, tagsets, avatar, description }, handleSubmit }) => {
            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Section
                  avatar={
                    <EditableAvatar src={avatar} size={'xl'} className={'mb-2'} name={'Avatar'} profileId={profileId} />
                  }
                >
                  <Header text={title} />
                  <Form.Row>
                    <FormikInputField
                      name={'displayName'}
                      title={'Display Name'}
                      value={displayName}
                      required={true}
                      readOnly={isReadOnlyMode}
                    />
                  </Form.Row>

                  <Form.Row>
                    <FormikInputField
                      name={'nameID'}
                      title={'Name ID'}
                      value={nameID}
                      required={true}
                      readOnly={isReadOnlyMode || isEditMode}
                    />
                  </Form.Row>

                  {!isCreateMode && (
                    <>
                      <Form.Row>
                        <FormikInputField
                          name={'description'}
                          title={'Description'}
                          value={description}
                          readOnly={isReadOnlyMode}
                          placeholder={'Description'}
                          as={'textarea'}
                        />
                      </Form.Row>

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
                    <div className={'d-flex mt-4'}>
                      <div className={'flex-grow-1'} />
                      {backButton}
                      <Button variant="primary" type={'submit'} className={'ml-3'}>
                        Save
                      </Button>
                    </div>
                  )}
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
