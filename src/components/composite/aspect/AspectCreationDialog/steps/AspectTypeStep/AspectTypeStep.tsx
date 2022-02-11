import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from '@mui/material/Skeleton';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import HelpButton from '../../../../../core/HelpButton';
import makeStyles from '@mui/styles/makeStyles';
import { InputAdornment } from '@mui/material';
import { useEcoverse } from '../../../../../../hooks';

const useStyles = makeStyles(theme => ({
  selectAdornment: {
    marginRight: theme.spacing(3),
  },
}));

export interface AspectTypeStepProps {
  type?: string;
  onChange: (type: string) => void;
}

const AspectTypeStep: FC<AspectTypeStepProps> = ({ type, onChange }) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { error, loading, template } = useEcoverse();

  if (error) {
    return <Typography>{t('components.aspect-creation.type-step.error')}</Typography>;
  }

  const aspectTypes = template.aspectTemplates.map(x => x.type);

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
              <InputAdornment className={styles.selectAdornment} position="end">
                <HelpButton helpText={t('components.aspect-creation.type-step.type-help-text')} />
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
