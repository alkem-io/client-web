import { Box, type BoxProps } from '@mui/material';
import type { UiContainer } from '@ory/kratos-client';
import { createContext, type Dispatch, type FormEvent, useContext, useState } from 'react';
import { isSubmittingPasswordFlow } from './helpers';

interface KratosFormProps extends BoxProps<'form'> {
  ui?: UiContainer;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
}

interface KratosFormContextValue {
  isFormValid: boolean;
  setIsFormValid: Dispatch<boolean>;
}

const KratosFormContext = createContext<KratosFormContextValue | null>(null);

const KratosForm = ({ ui, children, onSubmit: customOnSubmit, ...formProps }: KratosFormProps) => {
  const [isFormValid, setIsFormValid] = useState(true);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (isSubmittingPasswordFlow(e)) {
      if (!e.currentTarget.checkValidity()) {
        setIsFormValid(false);
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }

    // If a custom onSubmit handler is provided, use it
    if (customOnSubmit) {
      customOnSubmit(e);
    }
  };

  const contextValue: KratosFormContextValue = { isFormValid, setIsFormValid };

  return (
    <Box
      component="form"
      action={ui?.action}
      method={ui?.method}
      onSubmit={handleSubmit}
      noValidate={true}
      {...formProps}
    >
      <KratosFormContext value={contextValue}>{children}</KratosFormContext>
    </Box>
  );
};

export default KratosForm;

export const useKratosFormContext = () => useContext(KratosFormContext);
