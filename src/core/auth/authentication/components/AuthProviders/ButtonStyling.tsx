import { ButtonProps, createTheme, ThemeProvider } from '@mui/material';
import { PaletteOptions, ThemeOptions } from '@mui/material/styles';
import { ComponentType, PropsWithChildren, ReactNode } from 'react';

type ButtonStylingProps<ChildProps extends Pick<ButtonProps, 'startIcon'>> = ChildProps & {
  options: Partial<Omit<ThemeOptions, 'palette'>> & { palette: Partial<PaletteOptions> };
  icon: ReactNode;
  component: ComponentType<ButtonProps>;
};

const ButtonStyling = <ChildProps extends ButtonProps>({
  options,
  icon,
  component: Button,
  ...buttonProps
}: PropsWithChildren<ButtonStylingProps<ChildProps>>) => {
  return (
    <ThemeProvider
      theme={theme => createTheme({ ...theme, ...options, palette: { ...theme.palette, ...options.palette } })}
    >
      <Button startIcon={icon} {...buttonProps} />
    </ThemeProvider>
  );
};

export default ButtonStyling;
