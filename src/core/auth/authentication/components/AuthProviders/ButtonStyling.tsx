import { ButtonProps, createTheme, ThemeProvider } from '@mui/material';
import { PaletteOptions, Theme, ThemeOptions } from '@mui/material/styles';
import { ComponentType, PropsWithChildren, ReactNode } from 'react';

type ButtonStylingProps<ChildProps extends Pick<ButtonProps, 'startIcon'>> = ChildProps & {
  styles?: Partial<Omit<ThemeOptions, 'palette'>> & { palette: Partial<PaletteOptions> };
  icon?: ReactNode;
  component: ComponentType<ChildProps>;
};

const ButtonStyling = <ChildProps extends Pick<ButtonProps, 'startIcon'>>({
  styles,
  icon,
  component: Button,
  ...buttonProps
}: PropsWithChildren<ButtonStylingProps<ChildProps>>) => {
  return (
    <ThemeProvider
      theme={theme =>
        createTheme({ ...(theme as Theme), ...styles, palette: { ...(theme as Theme).palette, ...styles?.palette } })
      }
    >
      <Button startIcon={icon} {...(buttonProps as ChildProps)} />
    </ThemeProvider>
  );
};

export default ButtonStyling;
