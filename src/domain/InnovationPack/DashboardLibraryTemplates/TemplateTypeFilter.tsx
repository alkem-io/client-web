import { Box, Chip } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';
import { TemplateType } from '../../../core/apollo/generated/graphql-schema';

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

  const templateTypeValues = Object.values(TemplateType) as (typeof TemplateType[keyof typeof TemplateType])[];

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {templateTypeValues.map(key => {
        const isSelected = value.includes(TemplateType[key]);
        return (
          <Chip
            key={key}
            label={
              <>
                {isSelected ? <CheckIcon /> : undefined} {t(`common.enums.templateType.${key}` as const)}
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
