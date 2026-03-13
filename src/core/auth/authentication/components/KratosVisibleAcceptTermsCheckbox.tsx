import AcceptTermsCheckbox, { type AcceptTermsCheckboxProps } from './AcceptTermsCheckbox';
import { getNodeName } from './Kratos/helpers';
import type { KratosProps } from './Kratos/KratosProps';

interface KratosVisibleAcceptTermsCheckboxProps extends AcceptTermsCheckboxProps, KratosProps {}

const KratosVisibleAcceptTermsCheckbox = ({ node, ...props }: KratosVisibleAcceptTermsCheckboxProps) => {
  return <AcceptTermsCheckbox name={getNodeName(node)} {...props} />;
};

export default KratosVisibleAcceptTermsCheckbox;
