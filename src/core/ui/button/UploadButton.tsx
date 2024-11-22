import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import React from 'react';
import { useTranslation } from 'react-i18next';
import FileUploadWrapper from '../upload/FileUploadWrapper';

/**
 * @param onFileSelected Callback fired when a file is selected
 * @param allowedTypes Array of MIME types that are allowed for upload (e.g. ['image/jpeg', 'image/png'])
 * @param icon Optional icon element to render an IconButton instead of a regular Button
 * @param text Optional button text (used when icon is not provided)
 * @param disabled Optional flag to disable the button
 */
type UploadButtonProps = {
  onFileSelected: (file: File) => void;
  allowedTypes: string[];
  icon?: React.ReactElement;
  text?: string;
  disabled?: boolean;
};

const UploadButton = ({ onFileSelected, allowedTypes, icon, text, disabled }: UploadButtonProps) => {
  const { t } = useTranslation();
  const label = text ?? t('components.file-upload.uploadFile');

  return (
    <FileUploadWrapper onFileSelected={onFileSelected} allowedTypes={allowedTypes}>
      {icon ? (
        <IconButton aria-label={label} disabled={disabled}>
          {icon}
        </IconButton>
      ) : (
        <Button aria-label={label} disabled={disabled}>
          {label}
        </Button>
      )}
    </FileUploadWrapper>
  );
};

export default UploadButton;
