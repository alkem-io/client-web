import { createContext, FC, PropsWithChildren, useContext } from 'react';

interface AcceptTermsContextProps extends PropsWithChildren {
  hasAcceptedTerms: boolean;
}

const AcceptTermsReactContext = createContext(false);

export const AcceptTermsContext: FC<AcceptTermsContextProps> = ({ hasAcceptedTerms, children }) => {
  return <AcceptTermsReactContext.Provider value={hasAcceptedTerms}>{children}</AcceptTermsReactContext.Provider>;
};

export const useHasAcceptedTerms = () => useContext(AcceptTermsReactContext);
