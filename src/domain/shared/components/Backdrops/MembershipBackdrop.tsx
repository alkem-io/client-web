import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import BackdropWithMessage, { BackdropProps } from './BackdropWithMessage';

/**
 * @deprecated figure out whether it's still needed
 */
const MembershipBackdrop: FC<BackdropProps> = ({ children, blockName, show = false }) => {
  const { t } = useTranslation();

  return (
    <BackdropWithMessage message={t('components.backdrop.private', { blockName })} children={children} show={show} />
  );
};

export default MembershipBackdrop;
