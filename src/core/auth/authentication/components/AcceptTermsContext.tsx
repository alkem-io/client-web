import { createContext, Dispatch, FC, useContext, useMemo, useState } from 'react';

interface AcceptTermsContextProvided {
  hasAcceptedTerms: boolean;
  setHasAcceptedTerms: Dispatch<boolean>;
}

const AcceptTermsReactContext = createContext<AcceptTermsContextProvided | null>(null);

export const AcceptTermsContext: FC = ({ children }) => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const provided = useMemo(
    () => ({
      hasAcceptedTerms,
      setHasAcceptedTerms,
    }),
    [hasAcceptedTerms, setHasAcceptedTerms]
  );

  return <AcceptTermsReactContext.Provider value={provided}>{children}</AcceptTermsReactContext.Provider>;
};

export const useHasAcceptedTerms = () => useContext(AcceptTermsReactContext)?.hasAcceptedTerms;
export const useSetHasAcceptedTerms = () => useContext(AcceptTermsReactContext)?.setHasAcceptedTerms;
