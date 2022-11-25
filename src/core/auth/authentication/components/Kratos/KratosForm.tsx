import { UiContainer } from '@ory/kratos-client';
import { Box, BoxProps } from '@mui/material';
import { createContext, Dispatch, FormEvent, useCallback, useContext, useMemo, useState } from 'react';

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
    const button = document.activeElement as HTMLButtonElement | null;
    // do check if only submitting password method
    if (button && button.name === 'method' && button.value === 'password') {
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
