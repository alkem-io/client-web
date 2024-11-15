import React from 'react';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import FormikAutocomplete from '@/core/ui/forms/FormikAutocomplete';
import Gutters from '@/core/ui/grid/Gutters';
import FormikSubmitButton from '../../../../shared/components/forms/FormikSubmitButton';

interface AssignPlanProps {
  onAssignPlan: (licensePlanId: string) => Promise<unknown>;
  licensePlans: { id: string; name: string }[];
}

interface AssignPlanFormValues {
  licensePlanId: string;
}

const AssignPlan = ({ licensePlans, onAssignPlan }: AssignPlanProps) => {
  const initialValues: Partial<AssignPlanFormValues> = {
    licensePlanId: undefined,
  };

  const handleSubmit = async (values: Partial<AssignPlanFormValues>) => {
    const { licensePlanId } = values as AssignPlanFormValues;
    await onAssignPlan(licensePlanId);
  };

  const validator = yup.object().shape({
    licensePlanId: yup.string().required('validation.required'),
  });

  return (
    <Formik initialValues={initialValues} validator={validator} onSubmit={handleSubmit}>
      <Form>
        <Gutters row>
          <FormikAutocomplete
            values={licensePlans}
            name="licensePlanId"
            sx={{ flexGrow: 1 }}
            label={'Assign License Plan'}
          />
          <FormikSubmitButton>Assign</FormikSubmitButton>
        </Gutters>
      </Form>
    </Formik>
  );
};

export default AssignPlan;
