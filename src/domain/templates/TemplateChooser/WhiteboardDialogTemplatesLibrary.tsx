import { Box, IconButton } from '@mui/material';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalGridColumns } from '../../../core/ui/grid/constants';
import { gutters } from '../../../core/ui/grid/utils';
import WhiteboardTemplatesLibrary from '../library/WhiteboardTemplatesLibrary/WhiteboardTemplatesLibrary';
import { LibraryIcon } from '../LibraryIcon';
import { WhiteboardTemplateWithContent } from '../cards/WhiteboardTemplateCard/WhiteboardTemplateWithContent';
import CollaborationTemplatesLibraryButton from '../library/CollaborationTemplatesLibrary/CollaborationTemplatesLibraryButton';

export interface WhiteboardDialogTemplatesLibraryProps {
  editModeEnabled?: boolean;
  onImportTemplate: (template: WhiteboardTemplateWithContent) => void;
}

const WhiteboardDialogTemplatesLibrary: FC<WhiteboardDialogTemplatesLibraryProps> = ({
  editModeEnabled = false,
  onImportTemplate,
  ...buttonProps
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const columns = useGlobalGridColumns();
  if (!buttonProps.children) {
    buttonProps.children = <>{t('buttons.find-template')}</>;
  }

  return (
    <>
      {editModeEnabled && (
        <Box height={gutters()} display="flex" alignItems="center" marginLeft={gutters()}>
          {columns <= 4 ? (
            <IconButton color="primary" onClick={() => setIsOpen(true)} aria-label={t('buttons.find-template')}>
              <LibraryIcon fontSize="small" />
            </IconButton>
          ) : (
            <CollaborationTemplatesLibraryButton onClick={() => setIsOpen(true)} />
          )}
          <WhiteboardTemplatesLibrary
            open={isOpen}
            onClose={() => setIsOpen(false)}
            onImportTemplate={onImportTemplate}
          />
        </Box>
      )}
    </>
  );
};

export default WhiteboardDialogTemplatesLibrary;
