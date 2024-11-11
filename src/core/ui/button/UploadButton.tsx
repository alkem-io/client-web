import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import FileUploadWrapper from '../upload/FileUploadWrapper';

interface UploadButtonProps {
  onFileSelected: (file: File) => void;
  allowedTypes: string[];
  icon?: React.ReactElement;
  text?: string;
  disabled?: boolean;
}

const UploadButton: FC<UploadButtonProps> = ({ onFileSelected, allowedTypes, icon, text, disabled }) => {
  const { t } = useTranslation();

  return (
    <FileUploadWrapper onFileSelected={onFileSelected} allowedTypes={allowedTypes}>
      {icon ? (
        <IconButton aria-label={t('components.file-upload.uploadFile')} disabled={disabled}>
          {icon}
        </IconButton>
      ) : (
        <Button aria-label={text} disabled={disabled}>
          {text}
        </Button>
      )}
    </FileUploadWrapper>
  );
};

export default UploadButton;
