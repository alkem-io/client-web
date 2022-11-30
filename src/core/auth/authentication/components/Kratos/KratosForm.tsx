import { UiContainer } from '@ory/kratos-client';
import { Box, BoxProps } from '@mui/material';
import { createContext, Dispatch, FormEvent, useCallback, useContext, useMemo, useState } from 'react';
import { isSubmittingPasswordFlow } from './helpers';

interface KratosFormProps extends BoxProps<'form'> {
  ui?: UiContainer;
}

interface KratosFormContextValue {
  isFormValid: boolean;
  setIsFormValid: Dispatch<boolean>;
}

const KratosFormContext = createContext<KratosFormContextValue | null>(null);

const KratosForm = ({ ui, children, ...formProps }: KratosFormProps) => {
  const [isFormValid, setIsFormValid] = useState(true);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    if (isSubmittingPasswordFlow(e)) {
      if (!e.currentTarget.checkValidity()) {
        setIsFormValid(false);
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
  }, []);

  const contextValue = useMemo<KratosFormContextValue>(
    () => ({ isFormValid, setIsFormValid }),
    [isFormValid, setIsFormValid]
  );

  return (
    <Box component="form" action={ui?.action} method={ui?.method} onSubmit={handleSubmit} noValidate {...formProps}>
      <KratosFormContext.Provider value={contextValue}>{children}</KratosFormContext.Provider>
    </Box>
  );
};

export default KratosForm;

export const useKratosFormContext = () => useContext(KratosFormContext);
