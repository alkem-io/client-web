import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationBar } from './NavigationBar';
import { Typography } from '../../atoms/Typography/Typography';

const meta: Meta<typeof NavigationBar> = {
  title: 'Organisms/NavigationBar',
  component: NavigationBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NavigationBar>;

export const Default: Story = {
  args: {
    logo: <Typography variant="h6">Logo</Typography>,
    items: [
      { label: 'Home', onClick: () => {} },
      { label: 'About', onClick: () => {} },
    ],
  },
};
