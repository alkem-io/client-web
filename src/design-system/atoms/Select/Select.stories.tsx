import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Atoms/Select',
  component: Select,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    label: 'Select Option',
    options: [
      { value: 1, label: 'Option 1' },
      { value: 2, label: 'Option 2' },
    ],
    fullWidth: true,
  },
};
