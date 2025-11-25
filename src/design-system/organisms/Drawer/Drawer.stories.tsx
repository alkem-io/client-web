import type { Meta } from '@storybook/react-vite';
import { Drawer } from './Drawer';
import { Button } from '../../atoms/Button/Button';
import { List } from '../../molecules/List/List';
import { useState } from 'react';
import { Box } from '@mui/material';

const meta: Meta<typeof Drawer> = {
  title: 'Organisms/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  argTypes: {
    anchor: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
    },
    variant: {
      control: 'select',
      options: ['permanent', 'persistent', 'temporary'],
    },
  },
};

export default meta;
// type Story = StoryObj<typeof Drawer>;

export const Temporary = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List
        items={['Inbox', 'Starred', 'Send email', 'Drafts'].map(text => ({
          id: text,
          primary: text,
        }))}
      />
    </Box>
  );

  return (
    <div>
      <Button onClick={toggleDrawer(true)}>Open Drawer</Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
};
