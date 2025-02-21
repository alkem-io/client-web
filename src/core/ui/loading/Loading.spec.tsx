/**
 * @jest-environment jsdom
 */
import { render, screen } from '@/main/test/testUtils';
import { describe, expect, test } from 'vitest';
import { Caption } from '../typography';
import Loading from './Loading';

describe('Loading component', () => {
  // Mathcing snapshot when we are using dynamicaly generated class names is ineffective
  test.skip('render correctly WrapperTypography component', () => {
    // arrange
    const { asFragment } = render(<Caption textTransform="uppercase" fontWeight="medium" color="primary.main" />);

    // act
    const html = asFragment();

    // assert
    expect(html).toMatchSnapshot(); // Mathcing snapshot when we are using dynamicaly generated class names is ineffective
  });

  // Mathcing snapshot when we are using dynamicaly generated class names is ineffective
  test.skip('render correctly loading component', () => {
    // arrange
    const text = 'Please wait';

    // act
    const { asFragment } = render(<Loading text={text} />);

    // assert
    expect(asFragment()).toMatchSnapshot(); // Mathcing snapshot when we are using dynamicaly generated class names is ineffective
  });

  test.skip('check loading with message', async () => {
    // arrange
    const message = 'Loading indicator';

    // act
    render(<Loading text={message} />);

    // assert
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
