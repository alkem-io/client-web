import React, { FC } from 'react';
import { Form, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Button from '../core/Button';
import {
  ContextInput,
  useRemoveReferenceMutation,
  useUpdateChallengeContextMutation,
  useUpdateOpportunityContextMutation,
} from '../../generated/graphql';
import * as yup from 'yup';
import { FieldArray, Formik } from 'formik';
import TextInput, { TextArea } from '../core/TextInput';
import { createStyles } from '../../hooks/useTheme';
import clsx from 'clsx';
import Typography from '../core/Typography';
import Divider from '../core/Divider';
import { QUERY_OPPORTUNITY_PROFILE } from '../../graphql/opportunity';
import { QUERY_CHALLENGE_PROFILE } from '../../graphql/challenge';

interface Props {
  variant: 'challenge' | 'opportunity';
  show: boolean;
  onHide: () => void;
  data: ContextInput;
  id: string;
}

const useContextEditStyles = createStyles(theme => ({
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
  body: {
    maxHeight: 600,
    overflow: 'auto',
  },
}));

const ContextEdit: FC<Props> = ({ show, onHide, variant, data, id }) => {
  const styles = useContextEditStyles();

  const initialValues: ContextInput = {
    background: data?.background || '',
    impact: data?.impact || '',
    tagline: data?.tagline || '',
    vision: data?.vision || '',
    who: data?.who || '',
    references: data?.references || [],
  };
  const validationSchema = yup.object().shape({
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

  const [updateChallenge] = useUpdateChallengeContextMutation({
    onCompleted: () => onHide(),
    onError: e => console.error(e),
    refetchQueries: [{ query: QUERY_CHALLENGE_PROFILE, variables: { id: Number(id) } }],
    awaitRefetchQueries: true,
  });
  const [updateOpportunity] = useUpdateOpportunityContextMutation({
    onCompleted: () => onHide(),
    onError: e => console.error(e),
    refetchQueries: [{ query: QUERY_OPPORTUNITY_PROFILE, variables: { id: Number(id) } }],
    awaitRefetchQueries: true,
  });
  const [removeRef] = useRemoveReferenceMutation();

  let submitWired;
  let referencesToRemove: string[] = [];

  const onSubmit = async values => {
    const updatedRefs = values.references.map(ref => ({ uri: ref.uri, name: ref.name }));
    const withUpdatedRefs = { ...values };
    withUpdatedRefs.references = updatedRefs;

    if (referencesToRemove.length > 0) {
      for (const ref of referencesToRemove) {
        await removeRef({ variables: { ID: Number(ref) } });
      }
    }

    if (variant === 'challenge') {
      await updateChallenge({
        variables: {
          challengeID: Number(id),
          challengeData: {
            context: withUpdatedRefs,
          },
        },
      });
    } else if (variant === 'opportunity') {
      await updateOpportunity({
        variables: {
          opportunityID: Number(id),
          opportunityData: {
            context: withUpdatedRefs,
          },
        },
      });
    } else {
      console.log('no handler found');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size={'xl'}>
      <Modal.Header closeButton>
        <Modal.Title>Edit context</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => onSubmit(values)}
        >
          {({ values: { references }, values, handleChange, errors, handleSubmit }) => {
            const getTextArea = (name: string, label: string) => (
              <TextArea
                onChange={handleChange}
                name={name}
                value={values[name] as string}
                label={label}
                error={!!errors[name]}
                className={styles.field}
              />
            );

            if (!submitWired) {
              submitWired = handleSubmit;
            }

            return (
              <>
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
                            <TextInput
                              label={'Name'}
                              name={`references.${index}.name`}
                              value={references[index].name as string}
                              onChange={handleChange}
                            />
                            <TextInput
                              label={'Url'}
                              name={`references.${index}.uri`}
                              value={references[index].uri as string}
                              onChange={handleChange}
                            />
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="negative" onClick={onHide} className={'mr-2'}>
          CANCEL
        </Button>
        <Button type={'submit'} variant="primary" onClick={() => submitWired()}>
          SAVE
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ContextEdit;
