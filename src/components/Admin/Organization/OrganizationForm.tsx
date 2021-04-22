import { Formik } from 'formik';
import React, { FC, useEffect, useMemo } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { useDeleteReferenceMutation, useTagsetsTemplateQuery } from '../../../generated/graphql';
import { OrganisationModel } from '../../../models/Organisation';
import { Reference, Tagset } from '../../../models/Profile';
import { Organisation, TagsetTemplate } from '../../../types/graphql-schema';
import { EditMode } from '../../../utils/editMode';
import Typography from '../../core/Typography';
import InputField from '../Common/InputField';
import { referenceSchemaFragment, ReferenceSegment } from '../Common/ReferenceSegment';
import TagsetSegment, { tagsetSchemaFragment } from '../Common/TagsetSegment';

/*local files imports end*/

const emptyOrganization = {
  name: '',
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
  const [removeRef] = useDeleteReferenceMutation();

  const { data: config } = useTagsetsTemplateQuery({});

  useEffect(() => {}, [config]);

  const isCreateMode = editMode === EditMode.new;
  const isEditMode = editMode === EditMode.edit;
  const isReadOnlyMode = editMode === EditMode.readOnly;

  const {
    name,
    textID,
    profile: { description, references, avatar },
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
    name: name || '',
    textID: textID || '',
    description: description || '',
    avatar: avatar || '',
    tagsets: tagsets || [],
    references: references || [],
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(t('forms.validations.required')),
    textID: yup.string().required(t('forms.validations.required')),
    avatar: yup.string(),
    description: yup.string().max(400),
    tagsets: tagsetSchemaFragment,
    references: referenceSchemaFragment,
  });

  /**
   * @handleSubmit
   * @param orgData instance of OrganisationModel
   * @return void
   * @summary if edits current organization data or creates a new one depending on the edit mode
   */
  const handleSubmit = async (orgData: OrganisationModel, initialReferences: Reference[]) => {
    const { tagsets, avatar, references, description, ...otherData } = orgData;

    const toRemove = initialReferences.filter(x => x.id && !references.some(r => r.id === x.id));

    for (const ref of toRemove) {
      await removeRef({ variables: { input: { ID: Number(ref.id) } } });
    }

    const organization: Organisation = {
      ...currentOrganization,
      ...otherData,
      profile: {
        description,
        avatar,
        references: [...references].map(t => ({ name: t.name, uri: t.uri })),
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
        <Typography variant={'h3'} className={'mt-4 mb-4'}>
          {title}
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => handleSubmit(values, references)}
        >
          {({ values: { name, textID, references, tagsets, avatar, description }, handleSubmit }) => {
            return (
              <Form noValidate>
                <Form.Row>
                  <InputField
                    name={'name'}
                    title={'Full Name'}
                    value={name}
                    required={true}
                    readOnly={isReadOnlyMode}
                  />
                </Form.Row>

                <Form.Row>
                  <InputField
                    name={'textID'}
                    title={'Text ID'}
                    value={textID}
                    required={true}
                    readOnly={isReadOnlyMode || isEditMode}
                  />
                </Form.Row>

                {!isCreateMode && (
                  <>
                    <Form.Row>
                      <InputField
                        name={'description'}
                        title={'Description'}
                        value={description}
                        readOnly={isReadOnlyMode}
                        placeholder={'Description'}
                        as={'textarea'}
                      />
                    </Form.Row>
                    <Form.Row>
                      <InputField
                        name={'avatar'}
                        title={'Avatar'}
                        value={avatar}
                        readOnly={isReadOnlyMode}
                        placeholder={'Avatar'}
                      />
                    </Form.Row>

                    <TagsetSegment tagsets={tagsets} readOnly={isReadOnlyMode} />
                    <ReferenceSegment references={references} readOnly={isReadOnlyMode} />
                  </>
                )}
                {!isReadOnlyMode && (
                  <div className={'d-flex mt-4'}>
                    <div className={'flex-grow-1'} />
                    {backButton}
                    <Button variant="primary" onClick={() => handleSubmit()} className={'ml-3'}>
                      Save
                    </Button>
                  </div>
                )}
              </Form>
            );
          }}
        </Formik>
      </>
    );
  }
};
export default OrganizationForm;
