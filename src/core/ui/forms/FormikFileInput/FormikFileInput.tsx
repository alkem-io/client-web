import React from 'react';
import { useField } from 'formik';
import FormikInputField, { FormikInputFieldProps } from '../FormikInputField/FormikInputField';
import FileUploadButton from '../../upload/FileUpload/FileUpload';
import { useStorageConfigContext } from '../../../../domain/platform/storage/StorageBucket/StorageConfigContext';

type FormikFileInputProps = FormikInputFieldProps & {
  referenceID?: string;
};

const FormikFileInput = ({ name, referenceID, ...props }: FormikFileInputProps) => {
  const [, , helpers] = useField(name);

  const storageConfig = useStorageConfigContext();

  return (
    <FormikInputField
      name={name}
      loading={!storageConfig}
      endAdornment={
        referenceID &&
        storageConfig && (
          <FileUploadButton onUpload={helpers.setValue} referenceID={referenceID} storageConfig={storageConfig} />
        )
      }
      {...props}
    />
  );
};

export default FormikFileInput;
