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
  defaultProtocol = DEFAULT_PROTOCOL,
  onChange,
  ...rest
}: FormikFileInputProps) => {
  const [field, , helpers] = useField(name);

  const storageConfig = useStorageConfigContext()?.storageConfig;

  const checkProtocol = () => {
    if (defaultProtocol) {
      if (field.value) {
        const currentValue = `${field.value}`; // make sure field.value is a string
        if (!currentValue.match(MATCH_PROTOCOL_REGEX)) {
          helpers.setValue(`${defaultProtocol}://${currentValue}`);
        }
      }
    }

    return;
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
      {...rest}
    />
  );
};

export default FormikFileInput;

type FormikFileInputProps = FormikInputFieldProps & {
  entityID?: string;
  defaultProtocol?: string;
  entityType?: FileUploadEntityType;
  onChange?: (fileName: string) => void;
};
