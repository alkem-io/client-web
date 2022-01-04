import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import UserCard from './UserCard';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Cards/UserCard',
  component: UserCard,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof UserCard>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof UserCard> = args => <UserCard {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  avatarSrc: 'https://eu.ui-avatars.com/api/?name=Chris+Backon&background=A69619&color=fff',
  city: 'London',
  country: 'UK',
  roleName: 'Admin',
  displayName: 'Chris Pi Backon',
  tags: ['Ai', 'React', 'TypeScript', 'Redux'],
  url: '/profile',
};
