import { Box, Button, Switch, Menu, MenuItem, styled, BoxProps } from '@mui/material';
import React, { useState } from 'react';
import { Identifiable } from '../../types/Identifiable';
import { uniqBy } from 'lodash';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

// Like for example a hub: { id, displayName }
type FilterableValue = {
  displayName: string;
} & Identifiable;
type FilterableValueStatus = FilterableValue & { selected: boolean };

// Styling
const Root = styled(Box)(() => ({
  position: 'relative',
}));

const MenuButton = styled(Box)(() => ({
  position: 'absolute',
  right: 0,
  top: 0,
}));

export interface CheckboxesFilterProps<T extends Identifiable> {
  caption: string;
  items: T[];
  enable?: boolean;
  filterableDataGetter: (data: T) => FilterableValue;
  children: (filteredItems: T[]) => React.ReactNode;
  sx?: BoxProps['sx'];
}

const CheckboxesFilter = <T extends Identifiable>({
  caption,
  items,
  enable = true,
  filterableDataGetter: getValue,
  children,
  sx,
}: CheckboxesFilterProps<T>) => {
  // Handle menu open/close
  const [buttonElement, setButtonElement] = React.useState<null | HTMLElement>(null);
  const open = Boolean(buttonElement);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setButtonElement(event.currentTarget);
  };
  const handleClose = () => {
    setButtonElement(null);
  };

  // Get all the posible filter values, like for example all the hubs:
  const values = uniqBy(items.map(getValue), item => item.id);

  const [filterStatus, setFilterStatus] = useState<FilterableValueStatus[]>(
    values.map(filter => ({ ...filter, selected: true }))
  );

  // Apply enabled filters:
  const filteredItems = items.filter(item => {
    const currentItemId = getValue(item).id;
    // Find enabled filter Ids and see if they include the item to be filtered:
    return filterStatus
      .filter(filter => filter.selected)
      .map(filter => filter.id)
      .includes(currentItemId);
  });

  const handleChangeFilter = (filterId: string) => {
    return () => {
      const checkboxFilter = filterStatus.find(filter => filter.id === filterId);
      if (!checkboxFilter) return;
      checkboxFilter.selected = !checkboxFilter.selected;
      setFilterStatus(filterStatus);
      handleClose();
    };
  };

  return (
    <Root>
      {enable && values.length > 0 && (
        <MenuButton sx={sx}>
          <Button onClick={handleClick} variant="outlined" startIcon={<FilterAltOutlinedIcon />}>
            {caption}
          </Button>
          <Menu anchorEl={buttonElement} open={open} onClose={handleClose}>
            {filterStatus.map(filter => (
              <MenuItem onClick={handleChangeFilter(filter.id)} key={`filter_${filter.id}`}>
                <Switch checked={filter.selected} />
                {filter.displayName}
              </MenuItem>
            ))}
          </Menu>
        </MenuButton>
      )}
      {children(filteredItems)}
    </Root>
  );
};
export default CheckboxesFilter;
