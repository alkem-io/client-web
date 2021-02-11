import { mount } from 'enzyme';
import React from 'react';
import { Spinner } from 'react-bootstrap';
import renderer from 'react-test-renderer';
import Loading from './Loading';
import Typography from './Typography';

it('render correctly Spinner component', () => {
  const SpinnerComponent = mount(<Spinner animation="grow" />);
  expect(SpinnerComponent).toMatchSnapshot();
});

it('render correctly Typography component', () => {
  const TypographyComponent = mount(<Typography variant="caption" color="primary" />);
  expect(TypographyComponent).toMatchSnapshot();
});

it('render correctly loading component', () => {
  const text = 'Please wait';
  const TextComponent = renderer.create(<Loading text={text} />).toJSON();
  expect(TextComponent).toMatchSnapshot();
});

it('check loading with message', () => {
  const message = 'Loading indicator';
  const LoadingComp = mount(<Loading text={message} />);
  expect(LoadingComp.text()).toEqual(message);
});

it('check loading without message', () => {
  const message = '';
  const LoadingComp = mount(<Loading text={message} />);
  expect(LoadingComp.text()).toEqual(message);
});
