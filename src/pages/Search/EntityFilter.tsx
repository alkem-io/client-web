import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel/InputLabel';
import Select from '@mui/material/Select';
import { OutlinedInput, SelectChangeEvent } from '@mui/material';
import getDepsValueFromObject from '../../domain/shared/utils/getDepsValueFromObject';
import { FilterConfig, FilterDefinition } from './Filter';

interface EntityFilterProps {
  config: FilterConfig;
  onChange: (value: FilterDefinition['value']) => void;
}

export const EntityFilter: FC<EntityFilterProps> = ({ config, onChange }) => {
  const { t } = useTranslation();

  const [state, setState] = useState<FilterDefinition>(config['all']);

  const handleChange = (e: SelectChangeEvent<string>) => {
    const typename = e.target.value;
    const filterKey = Object.keys(config).find(x => config[x].typename === typename);

    if (!filterKey) {
      throw new Error(`Unrecognized filter key: ${filterKey}`);
    }

    setState(config[filterKey]);
    onChange(config[filterKey].value);
  };

  const depsValueFromObjectConfig = getDepsValueFromObject(config);

  const menuItems = useMemo(
    () =>
      Object.keys(config).map((x, i) => (
        <MenuItem key={`menu-item-${i}`} value={config[x].typename}>
          {config[x].title}
        </MenuItem>
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [depsValueFromObjectConfig]
  );

  return (
    <FormControl variant="outlined" sx={{ minWidth: 180 }}>
      <InputLabel id="filter-select-label">{t('common.filter')}</InputLabel>
      <Select
        labelId="filter-select-label"
        id="filter-select"
        variant="outlined"
        value={state.typename}
        label={state.title}
        onChange={handleChange}
        input={<OutlinedInput notched label={t('common.filter')} />}
      >
        {menuItems}
      </Select>
    </FormControl>
  );
};
