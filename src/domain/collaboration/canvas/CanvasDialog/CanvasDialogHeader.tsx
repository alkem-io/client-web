import { Box, Button } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import { LibraryIcon } from '../../../../common/icons/LibraryIcon';
import Authorship from '../../../../core/ui/authorship/Authorship';
import { gutters } from '../../../../core/ui/grid/utils';
import { PageTitle } from '../../../../core/ui/typography';

interface CanvasDialogHeaderProps {
  editMode: boolean;
  canvasDisplayName: string | undefined;
  authorDisplayName?: string;
  authorAvatarUri?: string;
  editDate?: Date;
  onLibraryButtonClick: () => void;
}

const CanvasDialogHeader: FC<CanvasDialogHeaderProps> = ({
  editMode,
  canvasDisplayName,
  authorDisplayName,
  authorAvatarUri,
  editDate,
  onLibraryButtonClick,
}) => {
  const { t } = useTranslation();

  return editMode ? (
    <Box display="flex" flexDirection="row" gap={1}>
      <Box
        component={FormikInputField}
        title={t('fields.displayName')}
        name="displayName"
        size="small"
        maxWidth={gutters(50)}
      />
      <Button variant="outlined" startIcon={<LibraryIcon />} onClick={onLibraryButtonClick}>
        {t('buttons.find-template')}
      </Button>
    </Box>
  ) : (
    <>
      <Authorship authorAvatarUri={authorAvatarUri} date={editDate}>
        {authorDisplayName}
      </Authorship>
      <PageTitle>{canvasDisplayName}</PageTitle>
    </>
  );
};

export default CanvasDialogHeader;
