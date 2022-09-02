import React, { ChangeEvent, ChangeEventHandler, FC, useCallback, useRef } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

interface UploadButtonProps {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  accept?: string;
  icon?: React.ReactElement;
  text?: string;
  disabled?: boolean;
}

export const UploadButton: FC<UploadButtonProps> = ({ onChange, accept, icon, text, disabled }) => {
  const ref = useRef<HTMLInputElement>(null);

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
    <IconButton color="primary" aria-label="upload image" onClick={handleButtonClick} disabled={disabled}>
      {icon}
    </IconButton>
  ) : (
    <Button aria-label="upload image" onClick={handleButtonClick} disabled={disabled}>
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
