import React from 'react';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import FormikAutocomplete from '@/core/ui/forms/FormikAutocomplete';
import Gutters from '@/core/ui/grid/Gutters';
import FormikSubmitButton from '@/domain/shared/components/forms/FormikSubmitButton';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';

interface AssignPlanProps {
  onAssignPlan: (licensePlanId: string) => Promise<unknown>;
  licensePlans: { id: string; name: string; sortOrder: number }[];
  activeLicensePlanIds?: string[];
}
interface AssignPlanFormValues {
  licensePlanId: string;
}

const AssignPlan = ({ licensePlans, onAssignPlan, activeLicensePlanIds = [] }: AssignPlanProps) => {
  // Sort license plans by sortOrder and filter out already assigned ones
  const availableLicensePlans = [...licensePlans]
    .filter(plan => !activeLicensePlanIds.includes(plan.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const initialValues: Partial<AssignPlanFormValues> = {
    licensePlanId: undefined,
  };

  const handleSubmit = async (values: Partial<AssignPlanFormValues>) => {
    const { licensePlanId } = values as AssignPlanFormValues;
    await onAssignPlan(licensePlanId);
  };

  const validator = yup.object().shape({
    licensePlanId: textLengthValidator({ required: true }),
  });

  return (
    <Formik initialValues={initialValues} validator={validator} onSubmit={handleSubmit}>
      <Form>
        <Gutters row>
          <FormikAutocomplete
            values={availableLicensePlans}
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
