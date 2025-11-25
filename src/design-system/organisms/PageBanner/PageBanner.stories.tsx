import { StoryObj } from '@storybook/react-vite';
import { PageBanner } from './PageBanner';

const meta = {
  title: 'Design System/Organisms/PageBanner',
  component: PageBanner,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    backgroundImage: { control: 'text' },
    height: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof PageBanner>;

export const Default: Story = {
  args: {
    title: 'Building Alkemio',
    subtitle: 'Providing society with a trusted platform to make impact, together',
  },
};

export const WithImage: Story = {
  args: {
    title: 'Building Alkemio',
    subtitle: 'Providing society with a trusted platform to make impact, together',
    backgroundImage: 'https://source.unsplash.com/random/1600x900?nature,mountain',
  },
};
