import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './Switch';
import { useState } from 'react';

const meta: Meta<typeof Switch> = {
  title: 'Atoms/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'info', 'success', 'warning', 'default'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    checked: false,
  },
};

export const WithLabel: Story = {
  args: {
    checked: true,
    label: 'Enable Notifications',
  },
};

export const Disabled: Story = {
  args: {
    checked: true,
    disabled: true,
    label: 'Disabled Switch',
  },
};

export const Interactive = () => {
  const [checked, setChecked] = useState(false);
  return <Switch checked={checked} onChange={setChecked} label={checked ? 'On' : 'Off'} />;
};
