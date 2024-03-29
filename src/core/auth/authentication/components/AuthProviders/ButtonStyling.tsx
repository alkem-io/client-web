import { ButtonProps, createTheme, ThemeProvider } from '@mui/material';
import { PaletteOptions, ThemeOptions } from '@mui/material/styles';
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
      theme={theme => createTheme({ ...theme, ...styles, palette: { ...theme.palette, ...styles?.palette } })}
    >
      <Button startIcon={icon} {...(buttonProps as ChildProps)} />
    </ThemeProvider>
  );
};

export default ButtonStyling;
