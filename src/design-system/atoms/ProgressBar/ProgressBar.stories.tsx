import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Design System/Atoms/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['determinate', 'indeterminate', 'buffer', 'query'] },
    color: { control: 'select', options: ['primary', 'secondary', 'inherit', 'success', 'error', 'info', 'warning'] },
    value: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Indeterminate: Story = {
  args: {
    variant: 'indeterminate',
  },
};

export const Determinate: Story = {
  args: {
    variant: 'determinate',
    value: 50,
  },
};
