import React from 'react';

import { FormikSelectValue } from '../../../../../core/ui/forms/FormikAutocomplete';

export type EventFormProps = {
  isSubmitting: boolean;
  actions: React.ReactNode;
  typeOptions: FormikSelectValue[];

  temporaryLocation?: boolean;
};
