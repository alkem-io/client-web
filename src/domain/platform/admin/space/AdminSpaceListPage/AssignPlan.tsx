import React from 'react';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import FormikAutocomplete from '@/core/ui/forms/FormikAutocomplete';
import Gutters from '@/core/ui/grid/Gutters';
import FormikSubmitButton from '@/domain/shared/components/forms/FormikSubmitButton';

interface AssignPlanProps {
  onAssignPlan: (licensePlanId: string) => Promise<unknown>;
  licensePlans: { id: string; name: string; sortOrder: number }[];
}

interface AssignPlanFormValues {
  licensePlanId: string;
}

const AssignPlan = ({ licensePlans, onAssignPlan }: AssignPlanProps) => {
  // Sort license plans by sortOrder
  const sortedLicensePlans = [...licensePlans].sort((a, b) => a.sortOrder - b.sortOrder);

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
            values={sortedLicensePlans}
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
