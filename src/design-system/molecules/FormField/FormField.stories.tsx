import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormField } from './FormField';
import { Input } from '../../atoms/Input/Input';

const meta: Meta<typeof FormField> = {
  title: 'Design System/Molecules/FormField',
  component: FormField,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  args: {
    label: 'Label',
    helperText: 'Helper text',
    children: <Input fullWidth />,
  },
};
