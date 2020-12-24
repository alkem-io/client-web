import React, { FC } from 'react';
import { Col, Form, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Button from '../core/Button';
import { ContextInput, useRemoveReferenceMutation } from '../../generated/graphql';
import * as yup from 'yup';
import { FieldArray, Formik } from 'formik';
import TextInput, { TextArea } from '../core/TextInput';
import { createStyles } from '../../hooks/useTheme';
import clsx from 'clsx';
import Typography from '../core/Typography';
import Divider from '../core/Divider';
import { removeReferences } from '../../utils/removeReferences';

interface Profile {
  name?: string;
  textID?: string;
  // state?: string;
}

interface Props {
  context: ContextInput;
  profile?: Profile;
  onSubmit: (formData: any) => void;
  wireSubmit: (setter: () => void) => void;
  contextOnly?: boolean;
}

interface InitialValues extends ContextInput, Profile {}

const useProfileStyles = createStyles(theme => ({
  field: {
    marginBottom: theme.shape.spacing(2),
  },
  row: {
    display: 'flex',
    gap: 20,
    alignItems: 'center',
    '& > div': {
      flexGrow: 1,
    },
  },
}));

const ProfileForm: FC<Props> = ({ context, profile, onSubmit, wireSubmit, contextOnly = false }) => {
  const styles = useProfileStyles();

  const initialValues: InitialValues = {
    name: profile?.name || '',
    textID: profile?.textID || '',
    // state: profile?.state || '',
    background: context?.background || '',
    impact: context?.impact || '',
    tagline: context?.tagline || '',
    vision: context?.vision || '',
    who: context?.who || '',
    references: context?.references || [],
  };

  const validationSchema = yup.object().shape({
    name: contextOnly ? yup.string() : yup.string().required(),
    textID: contextOnly ? yup.string() : yup.string().required().min(3, 'TextID should be at least 3 symbols long'),
    // state: contextOnly ? yup.string() : yup.string().required(),
    background: yup.string().required(),
    impact: yup.string().required(),
    tagline: yup.string().required(),
    vision: yup.string().required(),
    who: yup.string().required(),
    references: yup.array().of(
      yup.object().shape({
        name: yup.string().required(),
        uri: yup.string().required(),
      })
    ),
  });

  const [removeRef] = useRemoveReferenceMutation();

  let isSubmitWired = false;
  let referencesToRemove: string[] = [];
  const ConditionalTextArea = contextOnly ? TextArea : Form.Control;
  const ConditionalTextInput = contextOnly ? TextInput : Form.Control;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async values => {
        await removeReferences(referencesToRemove, removeRef);
        onSubmit(values);
      }}
    >
      {({ values: { references }, values, handleChange, handleBlur, errors, touched, handleSubmit }) => {
        const getTextArea = (name: string, label: string) => {
          const fieldProps = {
            ...(contextOnly
              ? { error: !!errors[name] && touched[name] }
              : { isInvalid: !!errors[name] && touched[name] }),
          };
          return (
            <Form.Group controlId={name}>
              {!contextOnly && <Form.Label>{label}</Form.Label>}
              <ConditionalTextArea
                onChange={handleChange}
                onBlur={handleBlur}
                name={name}
                value={values[name] as string}
                label={label}
                className={styles.field}
                rows={contextOnly ? 2 : 3}
                as={'textarea'}
                {...fieldProps}
              />
              {errors[name] && <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>}
            </Form.Group>
          );
        };

        if (!isSubmitWired) {
          wireSubmit(handleSubmit);
          isSubmitWired = true;
        }

        return (
          <>
            {!contextOnly && (
              <>
                {getTextArea('name', 'Name')}
                {getTextArea('textID', 'Text ID')}
                {/*{getTextArea('state', 'State')}*/}
              </>
            )}
            {getTextArea('background', 'Background')}
            {getTextArea('impact', 'Impact')}
            {getTextArea('tagline', 'Tagline')}
            {getTextArea('vision', 'Vision')}
            {getTextArea('who', 'Who')}

            <FieldArray name={'references'}>
              {({ push, remove }) => (
                <div>
                  <div className={'d-flex mb-4 align-items-center'}>
                    <Typography variant={'h4'} color={'primary'}>
                      References
                    </Typography>
                    <div className={'flex-grow-1'} />
                    <OverlayTrigger
                      overlay={
                        <Tooltip id={'Add a reference'} placement={'bottom'}>
                          Add a reference
                        </Tooltip>
                      }
                    >
                      <Button onClick={() => push({ name: '', uri: '' })}>+</Button>
                    </OverlayTrigger>
                  </div>

                  {references && references?.length === 0 ? (
                    <Form.Control type={'text'} placeholder={'No references yet'} readOnly={true} disabled={true} />
                  ) : (
                    references?.map((ref, index) => (
                      <div className={clsx(styles.row, styles.field)} key={index}>
                        <FormGroup as={Col}>
                          {!contextOnly && <Form.Label>Name</Form.Label>}
                          <ConditionalTextInput
                            label={'Name'}
                            name={`references.${index}.name`}
                            value={references[index].name as string}
                            onChange={handleChange}
                          />
                        </FormGroup>
                        <FormGroup>
                          {!contextOnly && <Form.Label>Url</Form.Label>}
                          <ConditionalTextInput
                            label={'Url'}
                            name={`references.${index}.uri`}
                            value={references[index].uri as string}
                            onChange={handleChange}
                          />
                        </FormGroup>
                        <OverlayTrigger
                          overlay={
                            <Tooltip id={'remove a reference'} placement={'bottom'}>
                              Remove the reference
                            </Tooltip>
                          }
                        >
                          <Button
                            onClick={() => {
                              remove(index);
                              // @ts-ignore
                              referencesToRemove.push(ref.id);
                            }}
                            variant={'negative'}
                          >
                            -
                          </Button>
                        </OverlayTrigger>
                      </div>
                    ))
                  )}
                </div>
              )}
            </FieldArray>
            <Divider />
          </>
        );
      }}
    </Formik>
  );
};

export default ProfileForm;
