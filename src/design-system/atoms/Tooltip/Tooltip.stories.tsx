import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { Button } from '../Button/Button';
import { IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const meta: Meta<typeof Tooltip> = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    arrow: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    title: 'This is a tooltip',
    children: <Button>Hover me</Button>,
  },
};

export const WithArrow: Story = {
  args: {
    title: 'Tooltip with arrow',
    arrow: true,
    children: <Button variant="outlined">Hover me</Button>,
  },
};

export const OnIcon: Story = {
  args: {
    title: 'Information',
    children: (
      <IconButton>
        <InfoIcon />
      </IconButton>
    ),
  },
};
