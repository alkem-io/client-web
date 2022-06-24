import { ComponentType, DOMAttributes, forwardRef, Ref, useCallback, useState } from 'react';

export const INITIAL_ELEVATION = 1;
export const FINAL_ELEVATION = 8;

interface ComponentProps<Element> extends Pick<DOMAttributes<Element>, 'onMouseOver' | 'onMouseOut'> {
  elevation?: number;
}

type Props<El, P extends ComponentProps<El>> = P & {
  elevationDisabled?: boolean;
};

interface Options {
  initialElevation?: number;
  finalElevation?: number;
}

const withElevationOnHover = <El, P extends ComponentProps<El>>(Component: ComponentType<P>, options: Options = {}) =>
  forwardRef((props: Props<El, P>, ref: Ref<El>) => {
    const { initialElevation = INITIAL_ELEVATION, finalElevation = FINAL_ELEVATION } = options;

    const { elevationDisabled = false, ...componentProps } = props;

    const [elevation, setElevation] = useState(elevationDisabled ? 0 : initialElevation);

    const setFinalElevation = useCallback(
      () => setElevation(elevationDisabled ? 0 : finalElevation),
      [elevationDisabled]
    );
    const setInitialElevation = useCallback(
      () => setElevation(elevationDisabled ? 0 : initialElevation),
      [elevationDisabled]
    );

    return (
      <Component
        ref={ref}
        elevation={elevation}
        onMouseOver={setFinalElevation}
        onMouseOut={setInitialElevation}
        {...(componentProps as P)}
      />
    );
  });

export default withElevationOnHover;
