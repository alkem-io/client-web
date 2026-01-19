import { gutters } from '@/core/ui/grid/utils';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import { BlockTitle } from '@/core/ui/typography';
import { useScreenSize } from '@/core/ui/grid/constants';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {
  Box,
  Checkbox,
  Drawer,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FILTER_OFF, FilterConfig, FilterDefinition } from './Filter';

interface EntityFilterProps {
  title?: string;
  currentFilter: FilterDefinition;
  config: FilterConfig;
  onChange: (value: FilterDefinition) => void;
}

export const EntityFilter: FC<EntityFilterProps> = ({ title, currentFilter, config, onChange }) => {
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isFilterMenuOpen, setFilterMenuOpen] = useState<boolean>(false);

  const handleChange = (typename: string) => {
    const filterKey = Object.keys(config).find(x => x === typename);

    if (!filterKey) {
      throw new Error(`Unrecognized filter key: ${filterKey}`);
    }

    onChange(config[filterKey]);
    setFilterMenuOpen(false);
  };

  const { isSmallScreen } = useScreenSize();

  return (
    <>
      <IconButton
        ref={buttonRef}
        onClick={() => setFilterMenuOpen(true)}
        sx={{
          marginRight: gutters(-0.5),
        }}
        aria-label={t('common.filter')}
      >
        <RoundedIcon
          component={FilterAltOutlinedIcon}
          size="medium"
          variant={currentFilter.typename === FILTER_OFF ? 'outlined' : 'filled'}
        />
      </IconButton>
      {/* Popup menu for big screens */}
      {!isSmallScreen && (
        <Menu anchorEl={buttonRef.current} open={isFilterMenuOpen} onClose={() => setFilterMenuOpen(false)}>
          {Object.keys(config).map(key => (
            <MenuItem
              key={`filter-menu-item-${key}`}
              value={config[key].typename}
              selected={config[key].typename === currentFilter.typename}
              onClick={() => handleChange(key)}
              disabled={config[key].disabled}
            >
              <>{t(config[key].title)}</>
            </MenuItem>
          ))}
        </Menu>
      )}
      {/* Bottom Drawer for small screens */}
      {isSmallScreen && (
        <Drawer anchor="bottom" open={isFilterMenuOpen} onClose={() => setFilterMenuOpen(false)}>
          <FormControl sx={{ padding: gutters(1) }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={gutters(1)}>
              <BlockTitle>{title}</BlockTitle>
              <RoundedIcon component={FilterAltOutlinedIcon} size="medium" />
            </Box>
            <FormGroup>
              {Object.keys(config).map(key => (
                <FormControlLabel
                  key={`filter-checkbox-${key}`}
                  labelPlacement="start"
                  disabled={config[key].disabled}
                  sx={{ justifyContent: 'space-between' }}
                  control={
                    <Checkbox
                      checked={currentFilter.typename === config[key].typename}
                      onClick={() => handleChange(key)}
                      sx={{ marginRight: gutters(0.5) }}
                    />
                  }
                  label={String(t(config[key].title))}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Drawer>
      )}
    </>
  );
};
