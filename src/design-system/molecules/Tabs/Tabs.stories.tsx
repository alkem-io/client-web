import { StoryObj } from '@storybook/react-vite';
import { Tabs } from './Tabs';
import { Home, Person, Settings } from '@mui/icons-material';
import React from 'react';

const meta = {
  title: 'Design System/Molecules/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: {
    value: 0,
    items: [
      { label: 'Item One', value: 0 },
      { label: 'Item Two', value: 1 },
      { label: 'Item Three', value: 2 },
    ],
    onChange: () => {},
  },
  render: args => {
    const [value, setValue] = React.useState(args.value);
    const handleChange = (_event: React.SyntheticEvent, newValue: string | number) => {
      setValue(newValue);
    };
    return <Tabs {...args} value={value} onChange={handleChange} />;
  },
};

export const WithIcons: Story = {
  args: {
    value: 0,
    items: [
      { label: 'Home', value: 0, icon: <Home /> },
      { label: 'Profile', value: 1, icon: <Person /> },
      { label: 'Settings', value: 2, icon: <Settings /> },
    ],
    onChange: () => {},
  },
  render: args => {
    const [value, setValue] = React.useState(args.value);
    const handleChange = (_event: React.SyntheticEvent, newValue: string | number) => {
      setValue(newValue);
    };
    return <Tabs {...args} value={value} onChange={handleChange} />;
  },
};
