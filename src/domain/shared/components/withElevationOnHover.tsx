import { type ComponentType, type DOMAttributes, useState } from 'react';

export const INITIAL_ELEVATION = 1;
export const FINAL_ELEVATION = 8;

interface ComponentProps<Element> extends Pick<DOMAttributes<Element>, 'onMouseOver' | 'onMouseOut'> {
  elevation?: number;
}

type WithElevationProps<El, P extends ComponentProps<El>> = P & {
  elevationDisabled?: boolean;
};

interface Options {
  initialElevation?: number;
  finalElevation?: number;
}

const withElevationOnHover =
  <El, P extends ComponentProps<El>>(Component: ComponentType<P>, options: Options = {}) =>
  ({
    ref,
    ...props
  }: WithElevationProps<El, P> & {
    ref?: React.Ref<El>;
  }) => {
    const { initialElevation = INITIAL_ELEVATION, finalElevation = FINAL_ELEVATION } = options;

    const { elevationDisabled = false, ...componentProps } = props;

    const [elevation, setElevation] = useState(initialElevation);

    const setFinalElevation = () => setElevation(elevationDisabled ? initialElevation : finalElevation);
    const setInitialElevation = () => setElevation(initialElevation);

    if (componentProps['$$typeof']) {
      delete componentProps['$$typeof'];
    }
    if (componentProps['propTypes']) {
      delete componentProps['propTypes'];
    }

    return (
      <Component
        ref={ref}
        elevation={elevation}
        onMouseOver={setFinalElevation}
        onMouseOut={setInitialElevation}
        {...(componentProps as unknown as P)}
      />
    );
  };

export default withElevationOnHover;
