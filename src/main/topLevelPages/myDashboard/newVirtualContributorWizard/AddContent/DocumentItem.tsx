import React, { ChangeEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Tooltip, IconButton, Theme, useMediaQuery, Link } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import Gutters from '@/core/ui/grid/Gutters';
import { DocumentValues } from './AddContentProps';
import FormikFileInput from '@/core/ui/forms/FormikFileInput/FormikFileInput';
import { useConfig } from '@/domain/platform/config/useConfig';
import { TranslateWithElements } from '@/domain/shared/i18n/TranslateWithElements';
import { noop } from 'lodash';

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

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return (
    <Gutters key={index} data-reference={index} row={!isMobile} disablePadding>
      <FormikInputField
        name={`documents[${index}].name`}
        title={t('createVirtualContributorWizard.addContent.documents.referenceTitle')}
        fullWidth={isMobile}
        value={document.name}
        required
      />
      <Box flexGrow={1} width={isMobile ? '100%' : undefined}>
        <Box display="flex">
          <FormikFileInput
            name={`documents[${index}].url`}
            required
            title={t('createVirtualContributorWizard.addContent.documents.referenceUrl')}
            fullWidth
            helperText={tLinks('components.referenceSegment.url-helper-text', {
              terms: {
                href: locations?.terms,
                'aria-label': t('components.referenceSegment.plaintext-helper-text'),
              },
            })}
            onChange={onChange}
            temporaryLocation
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
