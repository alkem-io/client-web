import { cleanup, render } from '../../utils/test/test-utils';
import Toolbar from './Toolbar';

afterEach(cleanup);
describe('Toolbar - main', () => {
  test('render correctly Toolbar component', () => {
    // arrange
    const { asFragment } = render(<Toolbar />);

    // act
    const html = asFragment();

    // assert
    expect(html).toMatchSnapshot();
  });
});
