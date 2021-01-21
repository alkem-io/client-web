import { FieldArray, Formik } from 'formik';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { Organisation, useRemoveReferenceMutation, useTagsetsTemplateQuery } from '../../../generated/graphql';
import { OrganisationModel } from '../../../models/Organisation';
import { Tagset } from '../../../models/User';
import { EditMode } from '../../../utils/editMode';
import Typography from '../../core/Typography';
import InputField from '../Common/InputField';
import TagsSegment from '../Common/TagsSegment';

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
  const [availableTagsets, setAvailableTagsets] = useState<string[]>([]);
  // const [isAddingTagset, setIsAddingTagset] = useState<boolean>(false);
  // const [selectedTagset, setSelectedTagset] = useState<string>(availableTagsets[0] || '');
  const history = useHistory();
  const [removeRef] = useRemoveReferenceMutation();

  const { data: config } = useTagsetsTemplateQuery({
    onCompleted: data => {
      const { tagsets: templateTagsets } = data.configuration.template.users[0];
      const orgTagsets = currentOrganization?.profile.tagsets.map(t => t.name.toLowerCase());
      const availableTagsetNames = templateTagsets?.filter(tt => !orgTagsets.includes(tt.toLowerCase())) || [];
      setAvailableTagsets(availableTagsetNames);
    },
  });

  useEffect(() => {}, [config]);

  let refsToRemove: string[] = [];

  const isCreateMode = editMode === EditMode.new;
  const isEditMode = editMode === EditMode.edit;
  const isReadOnlyMode = editMode === EditMode.readOnly;

  const {
    name,
    profile: { description, references, avatar },
  } = currentOrganization;

  const tagsets = useMemo(() => {
    let {
      profile: { tagsets },
    } = currentOrganization;
    return availableTagsets.reduce(
      (acc, cur) => {
        if (acc.every(x => x.name.toLowerCase() !== cur.toLowerCase())) {
          acc.push({ name: cur, tags: [] });
        }
        return acc;
      },
      [...(tagsets as Tagset[])]
    );
  }, [currentOrganization, availableTagsets]);

  const initialValues = {
    name: name || '',
    description: description || '',
    avatar: avatar || '',
    tagsets: tagsets || [],
    references: references || [],
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required('This is the required field'),
    avatar: yup.string(),
    tagsets: yup.array().of(
      yup.object().shape({
        name: yup.string(),
        tags: yup.array().of(yup.string()),
      })
    ),
    references: yup.array().of(
      yup.object().shape({
        name: yup.string(),
        uri: yup.string(),
      })
    ),
    description: yup.string().max(400),
  });

  /**
   * @handleSubmit
   * @param orgData instance of OrganisationModel
   * @return void
   * @summary if edits current organization data or creates a new one depending on the edit mode
   */
  const handleSubmit = async (orgData: OrganisationModel) => {
    if (refsToRemove.length !== 0) {
      for (const ref of refsToRemove) {
        await removeRef({ variables: { ID: Number(ref) } });
      }
    }

    const { tagsets, avatar, references, description, ...otherData } = orgData;

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
          onSubmit={values => handleSubmit(values)}
        >
          {({
            values: { name, references, tagsets, avatar, description },
            setFieldValue: _setFieldValue,
            handleChange: _handleChange,
            handleSubmit,
          }) => {
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

                    <TagsSegment tagsets={tagsets} isReadOnlyMode={isReadOnlyMode} />
                    <FieldArray name={'references'}>
                      {({ push, remove }) => (
                        <>
                          <Form.Row>
                            <Form.Group as={Col}>
                              <Form.Label>References</Form.Label>
                              {!isReadOnlyMode && (
                                <Button className={'ml-3'} onClick={() => push({ name: '', uri: '' })}>
                                  Add
                                </Button>
                              )}
                            </Form.Group>
                          </Form.Row>
                          {isReadOnlyMode && references?.length === 0 ? (
                            <Form.Control
                              type={'text'}
                              placeholder={'No references yet'}
                              readOnly={true}
                              disabled={true}
                            />
                          ) : (
                            references?.map((ref, index) => (
                              <Form.Row key={index}>
                                <InputField
                                  name={`references.${index}.name`}
                                  title={'Name'}
                                  value={references[index].name}
                                  readOnly={isReadOnlyMode}
                                />
                                <InputField
                                  name={`references.${index}.uri`}
                                  title={'URI'}
                                  value={references[index].uri}
                                  readOnly={isReadOnlyMode}
                                />
                                <Form.Group as={Col} xs={2} className={'form-grp-remove'}>
                                  <Button
                                    onClick={() => {
                                      remove(index);
                                      isEditMode && ref.id && refsToRemove.push(ref.id);
                                    }}
                                    variant={'danger'}
                                  >
                                    Remove
                                  </Button>
                                </Form.Group>
                              </Form.Row>
                            ))
                          )}
                        </>
                      )}
                    </FieldArray>
                  </>
                )}
                {!isReadOnlyMode && (
                  <>
                    <div className={'d-flex mt-4'}>
                      <div className={'flex-grow-1'} />
                      {backButton}
                      <Button variant="primary" onClick={() => handleSubmit()} className={'ml-3'}>
                        Save
                      </Button>
                    </div>
                  </>
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
