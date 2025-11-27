import { StoryObj } from '@storybook/react-vite';
import { List } from './List';
import { Inbox, Drafts } from '@mui/icons-material';

const meta = {
  title: 'Design System/Molecules/List',
  component: List,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof List>;

export const Default: Story = {
  args: {
    items: [
      { id: 1, primary: 'Inbox', icon: <Inbox /> },
      { id: 2, primary: 'Drafts', icon: <Drafts /> },
    ],
  },
};

export const WithSecondaryText: Story = {
  args: {
    items: [
      { id: 1, primary: 'Brunch this weekend?', secondary: "I'll be in your neighborhood doing errands this weekend." },
      { id: 2, primary: 'Summer BBQ', secondary: "Wish I could come, but I'm out of town this weekend." },
    ],
  },
};
