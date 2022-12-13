import { useHasAcceptedTerms } from './AcceptTermsContext';
import { AuthActionButtonProps } from './Button';
import AcceptTermsButton from './AcceptTermsButton';

const AcceptTermsButtonContextual = (props: AuthActionButtonProps) => {
  const hasAcceptedTerms = useHasAcceptedTerms();

  return <AcceptTermsButton hasAcceptedTerms={hasAcceptedTerms} {...props} />;
};

export default AcceptTermsButtonContextual;
