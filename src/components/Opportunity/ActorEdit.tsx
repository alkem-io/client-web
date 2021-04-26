import { Formik } from 'formik';
import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import * as yup from 'yup';
import {
  OpportunityActorGroupsDocument,
  useCreateActorMutation,
  useUpdateActorMutation,
} from '../../generated/graphql';
import { Actor } from '../../types/graphql-schema';
import { createStyles } from '../../hooks/useTheme';
import Button from '../core/Button';
import TextInput, { TextArea } from '../core/TextInput';

interface Props {
  show: boolean;
  onHide: () => void;
  data?: Actor;
  id?: string;
  opportunityId?: string | undefined;
  actorGroupId?: string | undefined;
  isCreate?: boolean;
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

const ActorEdit: FC<Props> = ({ show, onHide, data, id, opportunityId, actorGroupId }) => {
  const styles = useContextEditStyles();

  const initialValues: Actor = {
    id: id || '',
    name: data?.name || '',
    description: data?.description || '',
    value: data?.value || '',
    impact: data?.impact || '',
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(),
    description: yup.string().required(),
    value: yup.string().required(),
    impact: yup.string().required(),
  });

  const [createActor] = useCreateActorMutation({
    onCompleted: () => onHide(),
    onError: e => console.error(e),
    refetchQueries: [{ query: OpportunityActorGroupsDocument, variables: { id: opportunityId } }],
    awaitRefetchQueries: true,
  });

  const [updateActor] = useUpdateActorMutation({
    onCompleted: () => onHide(),
    onError: e => console.error(e),
    awaitRefetchQueries: true,
  });

  const onSubmit = (values: Actor) => {
    const { id: actorId, __typename, ...rest } = values;
    if (!id) {
      createActor({
        variables: {
          input: {
            parentID: Number(actorGroupId),
            ...rest,
          },
        },
      });

      return;
    }
    if (id) {
      updateActor({
        variables: {
          input: {
            ID: id,
            ...rest,
          },
        },
      });
    }
  };

  let submitWired;

  return (
    <Modal show={show} onHide={onHide} centered size={'xl'}>
      <Modal.Header closeButton>
        <Modal.Title>{!id ? 'Create' : 'Edit'} Actor</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => onSubmit(values)}
        >
          {({ values, handleChange, errors, handleSubmit, touched }) => {
            const getField = (name: string, label: string, type?: 'input' | 'textArea') => (
              <>
                {type === 'input' ? (
                  <TextInput
                    onChange={handleChange}
                    name={name}
                    value={values[name] as string}
                    label={label}
                    error={touched[name] && !!errors[name]}
                    className={styles.field}
                  />
                ) : (
                  <TextArea
                    onChange={handleChange}
                    name={name}
                    value={values[name] as string}
                    label={label}
                    error={touched[name] && !!errors[name]}
                    className={styles.field}
                    rows={2}
                  />
                )}
              </>
            );

            if (!submitWired) {
              submitWired = handleSubmit;
            }

            return (
              <>
                {getField('name', 'Name', 'input')}
                {getField('description', 'Description')}
                {getField('value', 'Value')}
                {getField('impact', 'Impact')}
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
          {!id ? 'Create' : 'SAVE'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ActorEdit;
