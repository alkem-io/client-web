import { createContext, FC, PropsWithChildren, useContext } from 'react';

interface AcceptTermsContextProps extends PropsWithChildren {
  hasAcceptedTerms: boolean;
}

export const AcceptTermsReactContext = createContext(false);

export const AcceptTermsContext: FC<AcceptTermsContextProps> = ({ hasAcceptedTerms, children }) => {
  return <AcceptTermsReactContext value={hasAcceptedTerms}>{children}</AcceptTermsReactContext>;
};

export const useHasAcceptedTerms = () => useContext(AcceptTermsReactContext);
