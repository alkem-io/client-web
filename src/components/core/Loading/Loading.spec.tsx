import Loading from './Loading';
import Typography from '../Typography';
import { render, screen } from '../../../utils/test/test-utils';

describe('Loading component', () => {
  test('render correctly Typography component', () => {
    // arrange
    const { asFragment } = render(<Typography variant="caption" color="primary" />);

    // act
    const html = asFragment();

    // assert
    expect(html).toMatchSnapshot();
  });

  test('render correctly loading component', () => {
    // arrange
    const text = 'Please wait';

    // act
    const { asFragment } = render(<Loading text={text} />);

    // assert
    expect(asFragment()).toMatchSnapshot();
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
