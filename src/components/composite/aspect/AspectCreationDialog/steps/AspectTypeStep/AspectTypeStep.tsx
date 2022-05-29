import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from '@mui/material/Skeleton';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import HelpButton from '../../../../../core/HelpButton';
import { InputAdornment } from '@mui/material';
import { useHub } from '../../../../../../hooks';

export interface AspectTypeStepProps {
  type?: string;
  onChange: (type: string) => void;
}

const AspectTypeStep: FC<AspectTypeStepProps> = ({ type, onChange }) => {
  const { t } = useTranslation();
  const { error, loading, templates } = useHub();

  if (error) {
    return <Typography>{t('components.aspect-creation.type-step.error')}</Typography>;
  }

  const aspectTypes = templates.aspectTemplates.map(x => x.type);

  return (
    <FormControl fullWidth>
      {loading ? (
        <Skeleton width={'100%'}>
          <Select>
            <MenuItem />
          </Select>
        </Skeleton>
      ) : (
        <>
          <InputLabel id="type-select-label" required>
            {t('components.aspect-creation.type-step.label')}
          </InputLabel>
          <Select
            labelId="type-select-label"
            id="type-select"
            value={type ?? ''}
            defaultValue={''}
            label={t('components.aspect-creation.type-step.label')}
            onChange={e => onChange(e.target.value)}
            endAdornment={
              <InputAdornment position="start">
                <HelpButton
                  helpText={
                    templates.aspectTemplates.find(x => x.type === type)?.description ??
                    t('components.aspect-creation.type-step.type-help-text-short')
                  }
                />
              </InputAdornment>
            }
          >
            {aspectTypes.map((x, i) => (
              <MenuItem key={i} value={x}>
                {x}
              </MenuItem>
            ))}
          </Select>
        </>
      )}
    </FormControl>
  );
};
export default AspectTypeStep;
