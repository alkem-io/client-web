import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import BackdropWithMessage, { BackdropProps } from './BackdropWithMessage';

/**
 * @deprecated figure out whether it's still needed
 */
const MembershipBackdrop = ({ children, blockName, show = false }: PropsWithChildren<BackdropProps>) => {
  const { t } = useTranslation();

  return (
    <BackdropWithMessage message={t('components.backdrop.private', { blockName })} show={show}>
      {children}
    </BackdropWithMessage>
  );
};

export default MembershipBackdrop;
