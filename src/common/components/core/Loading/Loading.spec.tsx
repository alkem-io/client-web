import Loading from './Loading';
import Typography from '../Typography';
import { render, screen } from '../../../utils/test/test-utils';

describe('Loading component', () => {
  // Mathcing snapshot when we are using dynamicaly generated class names is ineffective
  test.skip('render correctly Typography component', () => {
    // arrange
    const { asFragment } = render(<Typography variant="caption" color="primary" />);

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

  test('check loading with message', async () => {
    // arrange
    const message = 'Loading indicator';

    // act
    render(<Loading text={message} />);

    // assert
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
