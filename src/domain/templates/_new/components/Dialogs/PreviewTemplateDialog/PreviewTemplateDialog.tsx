import { FC, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../../../core/ui/dialog/DialogWithGrid';
import { BlockTitle } from '../../../../../../core/ui/typography';
import DialogContent from '../../../../../../core/ui/dialog/DialogContent';
import { AnyTemplate } from '../../../models/TemplateBase';
import TemplatePreview from '../../Previews/TemplatePreview';
import { Box, Button, Tooltip } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';

const DisabledUseButton = () => {
  const { t } = useTranslation();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  return (
    <Tooltip
      title={t('pages.innovationLibrary.useTemplateButton')}
      open={tooltipOpen}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
      arrow
    >
      <Box onClick={() => setTooltipOpen(true)}>
        <Button
          startIcon={<SystemUpdateAltIcon />}
          disabled
          variant="contained"
          sx={{ marginLeft: theme => theme.spacing(1) }}
        >
          {t('buttons.use')}
        </Button>
      </Box>
    </Tooltip>
  );
};


export interface PreviewTemplateDialogProps {
  open?: boolean;
  onClose: () => void;
  template: AnyTemplate;
  actions?: ReactNode;
}

const PreviewTemplateDialog: FC<PreviewTemplateDialogProps> = ({
  open = false,
  template,
  onClose,
  actions,
}) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid open={open} columns={12} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>
          {t('common.preview')} — {template.profile.displayName}
        </BlockTitle>
      </DialogHeader>
      <DialogContent>
        <TemplatePreview
          template={template}
          onClose={onClose}
          actions={actions ?? <DisabledUseButton />}
        />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default PreviewTemplateDialog;
