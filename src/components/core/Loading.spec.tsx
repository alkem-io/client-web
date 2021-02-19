import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import React from 'react';

import Loading from './Loading';
import { Spinner } from 'react-bootstrap';
import Typography from './Typography';

test('render correctly Spinner component', () => {
  const SpinnerComponent = mount(<Spinner animation="grow" />);
  expect(SpinnerComponent).toMatchSnapshot();
});

test('render correctly Typography component', () => {
  const TypographyComponent = mount(<Typography variant="caption" color="primary" />);
  expect(TypographyComponent).toMatchSnapshot();
});

test('render correctly loading component', () => {
  const text = 'Please wait';
  const TextComponent = renderer.create(<Loading text={text} />).toJSON();
  expect(TextComponent).toMatchSnapshot();
});

test('check loading with message', () => {
  const message = 'Loading indicator';
  const LoadingComp = mount(<Loading text={message} />);
  expect(LoadingComp.text()).toEqual(message);
});

test('check loading without message', () => {
  const message = '';
  const LoadingComp = mount(<Loading text={message} />);
  expect(LoadingComp.text()).toEqual(message);
});
