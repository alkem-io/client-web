import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Box, IconButton, Link, Tooltip } from '@mui/material';
import { noop } from 'lodash-es';
import type { ChangeEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import FormikFileInput from '@/core/ui/forms/FormikFileInput/FormikFileInput';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { useScreenSize } from '@/core/ui/grid/constants';
import Gutters from '@/core/ui/grid/Gutters';
import { useConfig } from '@/domain/platform/config/useConfig';
import { TranslateWithElements } from '@/domain/shared/i18n/TranslateWithElements';
import type { DocumentValues } from './AddContentProps';

interface DocumentItemProps {
  document: DocumentValues;
  index: number;
  onDelete: (index: number) => void;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> & ((fileName: string) => void);
}

export const DocumentItem = ({ document, index, onDelete, onChange = noop }: DocumentItemProps) => {
  const { t } = useTranslation();
  const { locations } = useConfig();
  const tLinks = TranslateWithElements(<Link target="_blank" />);

  const { isSmallScreen } = useScreenSize();

  return (
    <Gutters key={index} data-reference={index} row={!isSmallScreen} disablePadding={true}>
      <FormikInputField
        name={`documents[${index}].name`}
        title={t('createVirtualContributorWizard.addContent.documents.referenceTitle')}
        fullWidth={isSmallScreen}
        value={document.name}
        required={true}
      />
      <Box flexGrow={1} width={isSmallScreen ? '100%' : undefined}>
        <Box display="flex">
          <FormikFileInput
            name={`documents[${index}].url`}
            required={true}
            title={t('createVirtualContributorWizard.addContent.documents.referenceUrl')}
            fullWidth={true}
            helperText={tLinks('components.referenceSegment.url-helper-text', {
              terms: {
                href: locations?.terms,
                'aria-label': t('components.referenceSegment.plaintext-helper-text'),
              },
            })}
            onChange={onChange}
            temporaryLocation={true}
          />
          <Box>
            <Tooltip
              title={t('createVirtualContributorWizard.addContent.documents.remove')}
              id={'remove-link'}
              placement={'bottom'}
            >
              <IconButton aria-label={t('buttons.delete')} onClick={() => onDelete(index)} size="large" color="primary">
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Gutters>
  );
};
