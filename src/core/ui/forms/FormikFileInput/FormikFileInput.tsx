import React from 'react';
import { useField } from 'formik';
import FormikInputField, { FormikInputFieldProps } from '../FormikInputField/FormikInputField';
import FileUploadButton, { FileUploadEntityType } from '../../upload/FileUpload/FileUpload';
import { useStorageConfigContext } from '../../../../domain/storage/StorageBucket/StorageConfigContext';

const DEFAULT_PROTOCOL = 'https';
const MATCH_PROTOCOL_REGEX = /^[a-z][a-z0-9+_-]{0,500}:\/\//i;

type FormikFileInputProps = FormikInputFieldProps & {
  entityID?: string;
  entityType?: FileUploadEntityType;
  defaultProtocol?: string;
  onChange?: (fileName: string) => void;
};

const FormikFileInput = ({
  name,
  entityID,
  defaultProtocol = DEFAULT_PROTOCOL,
  entityType,
  onChange,
  ...props
}: FormikFileInputProps) => {
  const [field, , helpers] = useField(name);

  const storageConfig = useStorageConfigContext();
  console.log('@@@ <FormikFileInput /> storageConfig >>>', storageConfig);

  const checkProtocol = () => {
    if (!defaultProtocol) {
      return;
    }
    if (field.value) {
      const currentValue = `${field.value}`; // make sure field.value is a string
      if (!currentValue.match(MATCH_PROTOCOL_REGEX)) {
        helpers.setValue(`${defaultProtocol}://${currentValue}`);
      }
    }
  };

  return (
    <FormikInputField
      name={name}
      loading={!storageConfig}
      endAdornment={
        storageConfig &&
        storageConfig.canUpload && (
          <FileUploadButton
            entityID={entityID}
            entityType={entityType}
            storageConfig={storageConfig}
            onUpload={helpers.setValue}
            onChange={(fileName: string) => onChange?.(fileName)}
          />
        )
      }
      onBlur={checkProtocol}
      {...props}
    />
  );
};

export default FormikFileInput;
