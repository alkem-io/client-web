export interface Palette {
  primary: string;
  positive: string;
  negative: string;
  neutralLight: string;
  neutralMedium: string;
  neutral: string;
  divider: string;
  background: string;
}

export interface TextDefinition {
  font: string;
  size: number;
}

export interface Typography {
  h1: TextDefinition;
  h2: TextDefinition;
  h3: TextDefinition;
  h4: TextDefinition;
  h5: TextDefinition;
  caption: TextDefinition;
  body: TextDefinition;
  button: TextDefinition;
}

export interface Shape {
  borderRadius: number;
  space: number;
  spacing: (x: number) => number;
}

export interface Sidebar {
  maxWidth: number;
  minWidth: number;
}

export interface EarlyAccessAlert {
  height: number;
}

export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface Media {
  breakpoints: Breakpoints;
  up: (val: keyof Breakpoints) => string;
  down: (val: keyof Breakpoints) => string;
}

export interface Theme {
  palette: Palette;
  typography: Typography;
  shape: Shape;
  media: Media;
  sidebar: Sidebar;
  earlyAccessAlert: EarlyAccessAlert;
}
