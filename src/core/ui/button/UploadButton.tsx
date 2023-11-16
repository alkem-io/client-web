import React, { ChangeEvent, ChangeEventHandler, FC, useCallback, useRef } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';

interface UploadButtonProps {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  accept?: string;
  icon?: React.ReactElement;
  text?: string;
  disabled?: boolean;
}

export const UploadButton: FC<UploadButtonProps> = ({ onChange, accept, icon, text, disabled }) => {
  const ref = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleButtonClick = () => {
    if (ref && ref.current) {
      ref.current.value = '';
      ref.current.click();
    }
  };

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    },
    [onChange]
  );

  const button = icon ? (
    <IconButton aria-label={t('components.file-upload.uploadFile')} onClick={handleButtonClick} disabled={disabled}>
      {icon}
    </IconButton>
  ) : (
    <Button aria-label={text} onClick={handleButtonClick} disabled={disabled}>
      {text}
    </Button>
  );

  return (
    <>
      {button}
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={handleChange} />
    </>
  );
};

export default UploadButton;
