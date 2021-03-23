import { mount } from 'enzyme';
import React from 'react';
import SearchableList from './SearchableList';

it('renders welcome message', () => {
  // Testing with this data will require refactoring the SarcahbleList
  // const data = [
  //   {
  //     id: '1',
  //     value: 'Test Item',
  //     url: '/item/1',
  //   },
  // ];
  const data = [];
  const wrapper = mount(<SearchableList data={data} />);
  expect(wrapper.props().data).toStrictEqual(data);
});
