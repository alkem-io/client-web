import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ErrorIcon } from 'bootstrap-icons/icons/exclamation-octagon.svg';
import Icon from './Icon';
import Typography from './Typography';

const ErrorBlock: FC<{ blockName: string }> = ({ blockName }) => {
  const { t } = useTranslation();
  return (
    <div className={'d-flex align-items-lg-center justify-content-lg-center'}>
      <Icon component={ErrorIcon} size={'xl'} color={'neutralMedium'} />
      <Typography variant={'h5'} color={'neutralMedium'} className={'ml-3'}>
        {t('components.errorblock.message', { blockName: blockName.toLocaleLowerCase() })}
      </Typography>
    </div>
  );
};
export default ErrorBlock;
