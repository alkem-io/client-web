import React, { ChangeEvent, ChangeEventHandler, FC, useCallback, useRef } from 'react';
import Button, { ButtonProps } from './Button';

interface UploadButtonProps extends Omit<ButtonProps, 'onClick'> {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  accept?: string;
}

export const UploadButton: FC<UploadButtonProps> = ({ onChange, children, ...props }) => {
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

  return (
    <>
      <Button onClick={handleButtonClick} {...props}>
        {children}
      </Button>
      <input ref={ref} type="file" style={{ display: 'none' }} onChange={handleChange} />
    </>
  );
};

export default UploadButton;
