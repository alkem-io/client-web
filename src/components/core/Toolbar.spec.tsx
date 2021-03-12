import Toolbar from './Toolbar';
import { cleanup, render } from '@testing-library/react';

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
