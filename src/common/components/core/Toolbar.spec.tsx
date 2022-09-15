import { cleanup, render } from '../../utils/test/test-utils';
import Toolbar from './Toolbar';

afterEach(cleanup);
describe('Toolbar - main', () => {
  // Mathcing snapshot when we are using dynamicaly generated class names is ineffective
  test.skip('render correctly Toolbar component', () => {
    // arrange
    const { asFragment } = render(<Toolbar />);

    // act
    const html = asFragment();

    // assert
    expect(html).toMatchSnapshot(); // Mathcing snapshot when we are using dynamicaly generated class names is ineffective
  });
});
