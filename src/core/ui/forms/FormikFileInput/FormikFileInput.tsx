import { useField } from 'formik';

import FileUploadButton, { type FileUploadEntityType } from '../../upload/FileUpload/FileUpload';
import FormikInputField, { type FormikInputFieldProps } from '../FormikInputField/FormikInputField';

import { useStorageConfigContext } from '../../../../domain/storage/StorageBucket/StorageConfigContext';

const DEFAULT_PROTOCOL = 'https';
const MATCH_PROTOCOL_REGEX = /^[a-z][a-z0-9+_-]{0,500}:\/\//i;

const FormikFileInput = ({
  name,
  entityID,
  entityType,
  temporaryLocation = false,
  defaultProtocol = DEFAULT_PROTOCOL,
  onChange,
  ...rest
}: FormikFileInputProps) => {
  const [field, , helpers] = useField(name);

  const storageConfig = useStorageConfigContext();

  const updatedStorageConfig = storageConfig ? { ...storageConfig, temporaryLocation } : null;

  const checkProtocol = () => {
    if (!defaultProtocol || !field.value) {
      return;
    }

    const currentValue = String(field.value);
    if (!currentValue.match(MATCH_PROTOCOL_REGEX)) {
      helpers.setValue(`${defaultProtocol}://${currentValue}`);
    }
  };

  return (
    <FormikInputField
      name={name}
      loading={!storageConfig}
      endAdornment={
        storageConfig &&
        storageConfig.canUpload &&
        updatedStorageConfig && (
          <FileUploadButton
            entityID={entityID}
            entityType={entityType}
            storageConfig={updatedStorageConfig}
            onChange={onChange}
            onUpload={helpers.setValue}
          />
        )
      }
      onBlur={checkProtocol}
      {...rest}
    />
  );
};

export default FormikFileInput;

type FormikFileInputProps = FormikInputFieldProps & {
  entityID?: string;
  defaultProtocol?: string;
  temporaryLocation?: boolean;
  entityType?: FileUploadEntityType;
  onChange?: (fileName: string) => void;
};
