import { Button } from '@mui/material';
import { Caption } from '../../core/ui/typography';
import { useState } from 'react';
import Gutters from '../../core/ui/grid/Gutters';
import { Actions } from '../../core/ui/actions/Actions';
import FlexColumnGrowDialog from '../../core/ui/dialog/FlexColumnGrowDialog';

const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const FlexColumnGrowModal = () => {
  const [items, setItems] = useState<string[]>([]);

  return (
    <FlexColumnGrowDialog
      open
      footer={
        <Actions justifyContent="space-between">
          <Button onClick={() => setItems(items => [...items, loremIpsum])}>Add Item</Button>
          <Button onClick={() => setItems([])} color="error">
            Clear
          </Button>
        </Actions>
      }
    >
      {items.map((item, index) => (
        <Gutters>
          <Caption key={index}>{item}</Caption>
        </Gutters>
      ))}
    </FlexColumnGrowDialog>
  );
};

export default FlexColumnGrowModal;
