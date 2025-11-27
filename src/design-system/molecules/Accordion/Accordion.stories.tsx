import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion } from './Accordion';
import { Typography } from '../../atoms/Typography/Typography';

const meta: Meta<typeof Accordion> = {
  title: 'Design System/Molecules/Accordion',
  component: Accordion,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  args: {
    summary: 'Accordion 1',
    details:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.',
  },
};

export const CustomContent: Story = {
  args: {
    summary: <Typography sx={{ width: '33%', flexShrink: 0 }}>General settings</Typography>,
    details: (
      <Typography color="text.secondary">
        Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat. Aliquam eget maximus est, id dignissim
        quam.
      </Typography>
    ),
  },
};
