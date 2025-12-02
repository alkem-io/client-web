import { useMemo } from 'react';
import { useField } from 'formik';
import FormikInputField, { FormikInputFieldProps } from '../FormikInputField/FormikInputField';
import FileUploadButton, { FileUploadEntityType, UploadedDocument } from '@/core/ui/upload/FileUpload/FileUpload';
import { useStorageConfigContext } from '@/domain/storage/StorageBucket/StorageConfigContext';

const DEFAULT_PROTOCOL = 'https';
const MATCH_PROTOCOL_REGEX = /^[a-z][a-z0-9+_-]{0,500}:\/\//i;

type FormikFileInputProps = FormikInputFieldProps & {
  entityID?: string;
  entityType?: FileUploadEntityType;
  defaultProtocol?: string;
  onChange?: (fileName: string) => void;
  onDocumentUploaded?: (document: UploadedDocument) => void;
  temporaryLocation?: boolean;
};

const FormikFileInput = ({
  name,
  entityID,
  defaultProtocol = DEFAULT_PROTOCOL,
  entityType,
  onChange,
  onDocumentUploaded,
  temporaryLocation = false,
  ...props
}: FormikFileInputProps) => {
  const [field, , helpers] = useField(name);

  const storageConfig = useStorageConfigContext();

  const updatedStorageConfig = useMemo(
    () => (storageConfig ? { ...storageConfig, temporaryLocation } : null),
    [storageConfig, temporaryLocation]
  );

  const checkProtocol = () => {
    helpers.setTouched(true);
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

  const onUpload = (fileId: string) => {
    helpers.setTouched(true);
    helpers.setValue(fileId);
  };

  return (
    <FormikInputField
      name={name}
      loading={!storageConfig}
      onBlur={checkProtocol}
      endAdornment={
        storageConfig &&
        storageConfig.canUpload &&
        updatedStorageConfig && (
          <FileUploadButton
            onUpload={onUpload}
            onDocumentUploaded={onDocumentUploaded}
            onChange={(fileName: string) => {
              helpers.setTouched(true);
              onChange?.(fileName);
            }}
            entityID={entityID}
            entityType={entityType}
            storageConfig={updatedStorageConfig}
          />
        )
      }
      {...props}
    />
  );
};

export default FormikFileInput;
