import React from 'react';
import { useField } from 'formik';
import FormikInputField, { FormikInputFieldProps } from '../FormikInputField/FormikInputField';
import FileUploadButton from '../../upload/FileUpload/FileUpload';
import { useStorageConfigContext } from '../../../../domain/storage/StorageBucket/StorageConfigContext';

const DEFAULT_PROTOCOL = 'https';
const MATCH_PROTOCOL_REGEX = /^[a-z][a-z0-9+_-]{0,500}:\/\//i;

type FormikFileInputProps = FormikInputFieldProps & {
  referenceID?: string;
  defaultProtocol?: string;
};

const FormikFileInput = ({ name, referenceID, defaultProtocol = DEFAULT_PROTOCOL, ...props }: FormikFileInputProps) => {
  const [field, , helpers] = useField(name);

  const storageConfig = useStorageConfigContext();

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
      onBlur={checkProtocol}
      endAdornment={
        storageConfig &&
        storageConfig.canUpload && (
          <FileUploadButton onUpload={helpers.setValue} referenceID={referenceID} storageConfig={storageConfig} />
        )
      }
      {...props}
    />
  );
};

export default FormikFileInput;
