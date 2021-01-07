import { FieldArray, Formik } from 'formik';
import React, { FC, useEffect, useState } from 'react';
import { Button, Col, Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { UserFromGenerated, UserModel } from '../../../models/User';
import Typography from '../../core/Typography';
import { useTagsetsTemplateQuery } from '../../../generated/graphql';
import { useRemoveReferenceMutation } from '../../../generated/graphql';
import { EditMode } from '../../../utils/editMode';

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
  const [isAddingTagset, setIsAddingTagset] = useState<boolean>(false);
  const [selectedTagset, setSelectedTagset] = useState<string>(availableTagsets[0] || '');
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

  const { name, profile } = currentOrganization;

  const initialValues = {
    name: name || '',
    description: profile?.description || '',
    avatar: profile?.avatar || '',
    tagsets: profile?.tagsets || [],
    references: profile?.references || [],
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
   * @param orgData instance of OrganizationModel (same as UserModel)
   * @return void
   * @summary if edits current organization data or creates a new one depending on the edit mode
   */
  const handleSubmit = async (orgData: UserFromGenerated) => {
    if (refsToRemove.length !== 0) {
      for (const ref of refsToRemove) {
        await removeRef({ variables: { ID: Number(ref) } });
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { challenges, groups, tagsets, avatar, references, bio, ...otherData } = orgData;
    const organization: UserModel = {
      ...currentOrganization,
      ...otherData,
      profile: {
        description: bio,
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
        <Typography variant={'h3'} className={'mt-4 mb-4'}>
          {title}
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          //@ts-ignore
          onSubmit={values => handleSubmit(values)}
        >
          {({
            values: { name, references, tagsets, avatar, description },
            setFieldValue,
            handleChange,
            handleSubmit,
            handleBlur,
            errors,
            touched,
          }) => {
            const getInputField = (
              title: string,
              value: string,
              fieldName: string,
              required = false,
              readOnly = false,
              type?: string,
              placeholder?: string,
              as?: React.ElementType
            ) => (
              <Form.Group as={Col}>
                <Form.Label>
                  {title}
                  {required && <span style={{ color: '#d93636' }}>{' *'}</span>}
                </Form.Label>
                <Form.Control
                  name={fieldName}
                  as={as ? as : 'input'}
                  type={type || 'text'}
                  placeholder={placeholder || title}
                  value={value}
                  onChange={handleChange}
                  required={required}
                  readOnly={readOnly}
                  disabled={readOnly}
                  isValid={required ? Boolean(!errors[fieldName]) && Boolean(touched[fieldName]) : undefined}
                  isInvalid={Boolean(!!errors[fieldName]) && Boolean(touched[fieldName])}
                  onBlur={handleBlur}
                />
                <Form.Control.Feedback type="invalid">{errors[fieldName]}</Form.Control.Feedback>
              </Form.Group>
            );

            return (
              <Form noValidate>
                <Form.Row>{getInputField('Full Name', name, 'name', true, isReadOnlyMode)}</Form.Row>

                {!isCreateMode && (
                  <>
                    <Form.Row>
                      {getInputField(
                        'Description',
                        description,
                        'description',
                        false,
                        isReadOnlyMode,
                        undefined,
                        'Description',
                        'textarea'
                      )}
                    </Form.Row>
                    <Form.Row>{getInputField('Avatar', avatar, 'avatar', false, isReadOnlyMode)}</Form.Row>

                    <FieldArray name={'tagsets'}>
                      {({ push, remove }) => (
                        <>
                          <Form.Row>
                            <Form.Group as={Col} xs={2}>
                              <Form.Label>Tagsets</Form.Label>
                              {!isReadOnlyMode && availableTagsets?.length > 0 && (
                                <Button
                                  className={'ml-3'}
                                  onClick={() => {
                                    setIsAddingTagset(true);
                                    setSelectedTagset(availableTagsets[0]);
                                  }}
                                  disabled={isAddingTagset}
                                >
                                  Add
                                </Button>
                              )}
                            </Form.Group>
                            {isAddingTagset && (
                              <>
                                <Form.Group controlId="tagsetName" as={Col} xs={2}>
                                  <Form.Control
                                    as="select"
                                    custom
                                    onChange={e => setSelectedTagset(e.target.value)}
                                    defaultValue={selectedTagset}
                                  >
                                    {availableTagsets?.map((at, index) => (
                                      <option value={at} key={index}>
                                        {at}
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group as={Col} xs={1}>
                                  <Button
                                    className={'ml-3'}
                                    variant={'secondary'}
                                    onClick={() => {
                                      setSelectedTagset('');
                                      setIsAddingTagset(false);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </Form.Group>
                                <Form.Group as={Col} xs={1}>
                                  {!isReadOnlyMode && (
                                    <Button
                                      className={'ml-3'}
                                      onClick={() => {
                                        push({ name: availableTagsets[0], tags: [] });
                                        setSelectedTagset('');
                                        setIsAddingTagset(false);
                                        setAvailableTagsets(availableTagsets.filter(t => t !== selectedTagset));
                                      }}
                                    >
                                      Confirm
                                    </Button>
                                  )}
                                </Form.Group>
                              </>
                            )}
                          </Form.Row>
                          {isReadOnlyMode && tagsets?.length === 0 ? (
                            <Form.Control
                              type={'text'}
                              placeholder={'No tagsets yet'}
                              readOnly={true}
                              disabled={true}
                            />
                          ) : (
                            tagsets.map((ts, index) => (
                              <Form.Row key={index} className={'mb-4 align-items-sm-end'}>
                                <Form.Group as={Col}>
                                  <Form.Label>Tagset</Form.Label>
                                  <Form.Control
                                    name={'Tagset'}
                                    type={'text'}
                                    value={tagsets[index].name}
                                    disabled={true}
                                  />
                                </Form.Group>
                                <Form.Group as={Col}>
                                  <Form.Label>Tags</Form.Label>
                                  <Form.Control
                                    name={`tagsets.${index}.tags`}
                                    type={'text'}
                                    placeholder={'innovation, AI, technology, blockchain'}
                                    value={tagsets[index].tags?.join(',')}
                                    disabled={isReadOnlyMode}
                                    onChange={e => {
                                      const stringValue = e.target.value;
                                      const tagsetArray = stringValue.split(',');
                                      setFieldValue(`tagsets.${index}.tags`, tagsetArray);
                                    }}
                                    onBlur={() => {
                                      const polishedTagsets = tagsets[index].tags.map(el => el.trim()).filter(el => el);
                                      setFieldValue(`tagsets.${index}.tags`, polishedTagsets);
                                    }}
                                  />
                                </Form.Group>
                                {!isReadOnlyMode && (
                                  <Form.Group as={Col} xs={2}>
                                    <Button
                                      onClick={() => {
                                        remove(index);
                                        setAvailableTagsets([...availableTagsets, tagsets[index].name]);
                                      }}
                                      variant={'danger'}
                                    >
                                      Remove
                                    </Button>
                                  </Form.Group>
                                )}
                              </Form.Row>
                            ))
                          )}
                        </>
                      )}
                    </FieldArray>

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
                                {getInputField(
                                  'Name',
                                  references[index].name,
                                  `references.${index}.name`,
                                  false,
                                  isReadOnlyMode
                                )}
                                {getInputField(
                                  'URI',
                                  references[index].uri,
                                  `references.${index}.uri`,
                                  false,
                                  isReadOnlyMode
                                )}
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
