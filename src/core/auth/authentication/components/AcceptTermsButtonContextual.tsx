import { useHasAcceptedTerms } from './AcceptTermsContext';
import { AuthActionButtonProps } from './Button';
import AcceptTermsButtonImpl from './AcceptTermsButtonImpl';

const AcceptTermsButtonContextual = (props: AuthActionButtonProps) => {
  const hasAcceptedTerms = useHasAcceptedTerms();

  return <AcceptTermsButtonImpl hasAcceptedTerms={hasAcceptedTerms} {...props} />;
};

export default AcceptTermsButtonContextual;
