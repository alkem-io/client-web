import { Box, Chip } from '@mui/material';
import { TemplateType } from '../InnovationPackProfilePage/InnovationPackProfilePage';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Caption } from '../../../../core/ui/typography';
import CheckIcon from '@mui/icons-material/Check';

interface TemplateTypeFilterProps {
  value: TemplateType[];
  onChange: (templateTypes: TemplateType[]) => void;
}

const TemplateTypeFilter: FC<TemplateTypeFilterProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const onClick = (templateType: TemplateType) => {
    if (value.includes(templateType)) {
      onChange(value.filter(t => t !== templateType));
    } else {
      onChange([...value, templateType]);
    }
  };

  const templateTypeNames = Object.keys(TemplateType) as (keyof typeof TemplateType)[];

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Caption>{t('common.show-subject')}</Caption>
      {templateTypeNames.map(key => {
        const isSelected = value.includes(TemplateType[key]);
        return (
          <Chip
            key={key}
            label={
              <>
                {isSelected ? <CheckIcon /> : undefined} {t(`common.enums.templateTypes.${key}` as const)}
              </>
            }
            variant={isSelected ? 'filled' : 'outlined'}
            color="primary"
            size="medium"
            onClick={() => onClick(TemplateType[key])}
            sx={{
              paddingX: theme => theme.spacing(1.5),
              svg: {
                width: theme => theme.spacing(1.5),
                verticalAlign: 'bottom',
                marginLeft: theme => theme.spacing(-1.5),
              },
            }}
          />
        );
      })}
    </Box>
  );
};

export default TemplateTypeFilter;
