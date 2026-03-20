import AcceptTermsButton from './AcceptTermsButton';
import { useHasAcceptedTerms } from './AcceptTermsContext';
import type { AuthActionButtonProps } from './Button';

const AcceptTermsButtonContextual = (props: AuthActionButtonProps) => {
  const hasAcceptedTerms = useHasAcceptedTerms();

  return <AcceptTermsButton hasAcceptedTerms={hasAcceptedTerms} {...props} />;
};

export default AcceptTermsButtonContextual;
