import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Button, Checkbox, ClickAwayListener, FormControlLabel, Paper, Popper } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { Caption } from '@/core/ui/typography';
import { POPPER_Z_INDEX } from '@/domain/communication/room/Comments/CommentInputField';

type TemplateTypeFilterMobileProps = {
  value: TemplateType[];
  onChange: (templateTypes: TemplateType[]) => void;
};

const TemplateTypeFilterMobile = ({ value, onChange }: TemplateTypeFilterMobileProps) => {
  const { t } = useTranslation();

  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchor(anchor ? null : event.currentTarget);
  const handleClose = () => setAnchor(null);

  const onCheckboxChange = (templateType: TemplateType, isChecked: boolean) => {
    if (isChecked) {
      onChange([...value, templateType]);
    } else {
      onChange(value.filter(t => t !== templateType));
    }
  };

  const templateTypeNames = Object.values(TemplateType);

  return (
    <>
      <Button
        onClick={handleOpen}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ paddingTop: 0, textTransform: 'capitalize' }}
      >
        {t('common.show')}
      </Button>
      <Popper open={!!anchor} anchorEl={anchor} sx={{ zIndex: POPPER_Z_INDEX }}>
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            elevation={3}
            sx={{
              display: 'flex',
              gap: 1,
              flexDirection: 'column',
              marginX: theme => theme.spacing(1.5),
              padding: theme => theme.spacing(1.5),
            }}
          >
            {templateTypeNames.map(key => {
              const isSelected = value.includes(key);
              return (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelected}
                      onChange={(_, isChecked) => onCheckboxChange(key, isChecked)}
                      name="filters"
                      sx={{ paddingY: 0 }}
                    />
                  }
                  label={<Caption>{t(`common.enums.templateType.${key}` as const)}</Caption>}
                />
              );
            })}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default TemplateTypeFilterMobile;
