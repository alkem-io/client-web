import { Identifiable } from '../../../shared/types/Identifiable';
import { Box, FormHelperText, MenuItem, Select } from '@mui/material';
import { SelectInputProps } from '@mui/material/Select/SelectInput';
import { useField } from 'formik';
import React, { MouseEventHandler, useMemo, useState } from 'react';
import CanvasValueContainer from '../../../../containers/canvas/CanvasValueContainer';
import CanvasWhiteboard from '../../../../components/composite/entities/Canvas/CanvasWhiteboard';
import TranslationKey from '../../../../types/TranslationKey';
import { useValidationMessageTranslation } from '../../../shared/i18n/ValidationMessageTranslation';

export interface Canvas extends Identifiable {
  displayName: string;
  value?: string;
}

interface CanvasFormikSelectInputProps {
  title: string;
  name: string;
  canvases: Canvas[] | undefined;
}

const CanvasFormikSelectInput = ({ title, name, canvases }: CanvasFormikSelectInputProps) => {
  const [canvasId, setCanvasId] = useState<string>();

  const tErr = useValidationMessageTranslation();

  const [field, meta, helpers] = useField(name);

  const handleChange: SelectInputProps<string>['onChange'] = event => {
    const selectedCanvasId = event.target.value;
    const canvas = canvases?.find(({ id }) => id === selectedCanvasId);
    setCanvasId(canvas?.id);
  };

  const hasValidationError = meta.touched && Boolean(meta.error);

  const canvasFromTemplate = useMemo(() => {
    return {
      id: '__template',
      value: field.value,
    };
  }, [field.value]);

  const preventSubmittingFormOnWhiteboardControlClick: MouseEventHandler = e => e.preventDefault();

  return (
    <>
      <CanvasValueContainer canvasId={canvasId} onCanvasValueLoaded={canvas => helpers.setValue(canvas?.value)}>
        {({ canvas: canvasLoaded }) => {
          return (
            <>
              <Select
                title={title}
                value={canvasId ?? ''}
                error={hasValidationError}
                onChange={handleChange}
                onBlur={() => helpers.setTouched(true)}
              >
                {canvases?.map(canvas => (
                  <MenuItem key={canvas.id} value={canvas.id}>
                    {canvas.displayName}
                  </MenuItem>
                ))}
              </Select>
              {hasValidationError && (
                <FormHelperText error={hasValidationError}>
                  {tErr(meta.error as TranslationKey, {
                    field: title,
                  })}
                </FormHelperText>
              )}
              <Box flex="1 1 0" onClick={preventSubmittingFormOnWhiteboardControlClick}>
                {(canvasLoaded || field.value) && (
                  <CanvasWhiteboard
                    entities={{
                      canvas: canvasFromTemplate,
                    }}
                    actions={{}}
                    options={{
                      viewModeEnabled: true,
                      UIOptions: {
                        canvasActions: {
                          export: false,
                        },
                      },
                    }}
                  />
                )}
              </Box>
            </>
          );
        }}
      </CanvasValueContainer>
    </>
  );
};

export default CanvasFormikSelectInput;
