import { ComponentType, DOMAttributes, forwardRef, useCallback, useState } from 'react';

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

const withElevationOnHover = <El, P extends ComponentProps<El>>(Component: ComponentType<P>, options: Options = {}) =>
  forwardRef<El, WithElevationProps<El, P>>((props, ref) => {
    const { initialElevation = INITIAL_ELEVATION, finalElevation = FINAL_ELEVATION } = options;

    const { elevationDisabled = false, ...componentProps } = props;

    const [elevation, setElevation] = useState(initialElevation);

    const setFinalElevation = useCallback(
      () => setElevation(elevationDisabled ? initialElevation : finalElevation),
      [elevationDisabled, initialElevation, finalElevation]
    );
    const setInitialElevation = useCallback(() => setElevation(initialElevation), [initialElevation]);

    if (componentProps['$$typeof']) {
      delete componentProps['$$typeof'];
    }
    // eslint-disable-next-line react/forbid-foreign-prop-types
    if (componentProps['propTypes']) {
      // eslint-disable-next-line react/forbid-foreign-prop-types
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
  });

export default withElevationOnHover;
