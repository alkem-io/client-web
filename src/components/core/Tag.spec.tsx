import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import React from 'react';

import Tag from './Tag';
import Typography from './Typography';

test('render correctly Typography component', () => {
  const TypographyComponent = mount(<Typography variant="caption" color="inherit" />);
  expect(TypographyComponent).toMatchSnapshot();
});

test('render correctly Tag component', () => {
  const text = 'Please wait';
  const TextComponent = renderer.create(<Tag text={text} />).toJSON();
  expect(TextComponent).toMatchSnapshot();
});

test('check Tag with message', () => {
  const message = 'Tag message';
  const TagComp = mount(<Tag text={message} />);
  expect(TagComp.text()).toEqual(message);
});

test('check Tag without message', () => {
  const message = '';
  const TagComp = mount(<Tag text={message} />);
  expect(TagComp.text()).toEqual(message);
});
