import { Formik } from 'formik';
import React, { FC } from 'react';
import { Form, Modal } from 'react-bootstrap';
import * as yup from 'yup';
import {
  OpportunityActorGroupsDocument,
  useCreateAspectMutation,
  useOpportunityProfileQuery,
  useOpportunityTemplateQuery,
  useUpdateAspectMutation,
} from '../../generated/graphql';
import { createStyles } from '../../hooks/useTheme';
import { useApolloErrorHandler } from '../../hooks/useApolloErrorHandler';
import { Aspect } from '../../types/graphql-schema';
import { replaceAll } from '../../utils/replaceAll';
import Button from '../core/Button';
import Loading from '../core/Loading';
import { TextArea } from '../core/TextInput';

interface Props {
  show: boolean;
  onHide: () => void;
  data?: Aspect;
  id?: string;
  opportunityId: string;
  actorGroupId?: string;
  isCreate?: boolean;
  existingAspectNames?: string[];
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

const AspectEdit: FC<Props> = ({ show, onHide, data, id, opportunityId, existingAspectNames }) => {
  const styles = useContextEditStyles();
  const handleError = useApolloErrorHandler();
  const { data: config } = useOpportunityTemplateQuery();
  const { data: opportunity, loading: loadingOpportunity } = useOpportunityProfileQuery({
    variables: { id: opportunityId },
  });
  const contextId = opportunity?.ecoverse?.opportunity?.context?.id;
  const aspectsTypes = config?.configuration.template.opportunities[0].aspects;
  const isCreate = !id;

  const availableTypes =
    isCreate && existingAspectNames
      ? aspectsTypes?.filter(at => !existingAspectNames.includes(replaceAll('_', ' ', at)))
      : aspectsTypes;

  const initialValues: Aspect = {
    id: id || '',
    title: (isCreate ? availableTypes && availableTypes[0] : data?.title) || '',
    framing: data?.framing || '',
    explanation: data?.explanation || '',
  };
  const validationSchema = yup.object().shape({
    title: yup.string().required(),
    framing: yup.string().required(),
    explanation: yup.string().required(),
  });

  const [updateAspect] = useUpdateAspectMutation({
    onCompleted: () => onHide(),
    onError: handleError,
    refetchQueries: [{ query: OpportunityActorGroupsDocument, variables: { id: opportunityId } }],
    awaitRefetchQueries: true,
  });

  const [createAspect] = useCreateAspectMutation({
    onCompleted: () => onHide(),
    onError: handleError,
    refetchQueries: [{ query: OpportunityActorGroupsDocument, variables: { id: opportunityId } }],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: Aspect) => {
    const { id: apectId, ...rest } = values;
    if (!apectId && contextId) {
      await createAspect({
        variables: {
          input: {
            parentID: contextId,
            ...rest,
          },
        },
      });

      return;
    } else {
      await updateAspect({
        variables: {
          input: {
            ID: apectId,
            ...rest,
          },
        },
      });
    }
  };

  let submitWired;

  if (loadingOpportunity) return <Loading text={'Loading opportunity'} />;

  return (
    <Modal show={show} onHide={onHide} centered size={'xl'}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Aspect</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => onSubmit(values)}
        >
          {({ values, handleChange, errors, touched, handleSubmit, setFieldValue }) => {
            const getField = (name: string, label: string) => (
              <TextArea
                onChange={handleChange}
                name={name}
                value={values[name] as string}
                label={label}
                error={touched[name] && !!errors[name]}
                className={styles.field}
                rows={2}
              />
            );

            if (!submitWired) {
              submitWired = handleSubmit;
            }

            return (
              <>
                <Form.Group controlId="aspectTypeSelect">
                  <Form.Label>Aspect Type</Form.Label>
                  <Form.Control
                    as="select"
                    custom
                    onChange={e => {
                      e.preventDefault();
                      setFieldValue('title', e.target.value);
                    }}
                    size={'lg'}
                    disabled={!isCreate}
                    defaultValue={values.title ? replaceAll('_', ' ', values.title) : values.title}
                  >
                    {availableTypes?.map((at, index) => (
                      <option value={at} key={index}>
                        {replaceAll('_', ' ', at)}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                {getField('framing', 'Framing')}
                {getField('explanation', 'Explanation')}
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

export default AspectEdit;
