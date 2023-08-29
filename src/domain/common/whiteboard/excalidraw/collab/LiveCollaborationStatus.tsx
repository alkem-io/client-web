import clsx from 'clsx';
import React from 'react';
import { UIAppState } from '@alkemio/excalidraw/types/types';
import { Button, ButtonProps } from '@mui/material';

export const UIAppStateContext = React.createContext<UIAppState>(null!);
export const useUIAppState = () => React.useContext(UIAppStateContext);

type Opts = {
  width?: number;
  height?: number;
  mirror?: true;
} & React.SVGProps<SVGSVGElement>;

export const createIcon = (d: string | React.ReactNode, opts: number | Opts = 512) => {
  const {
    width = 512,
    height = width,
    mirror,
    style,
    ...rest
  } = typeof opts === 'number' ? ({ width: opts } as Opts) : opts;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      className={clsx({ 'rtl-mirror': mirror })}
      style={style}
      {...rest}
    >
      {typeof d === 'string' ? <path fill="currentColor" d={d} /> : d}
    </svg>
  );
};

const tablerIconProps: Opts = {
  width: 24,
  height: 24,
  fill: 'none',
  strokeWidth: 2,
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export const usersIcon = createIcon(
  <g strokeWidth="1.5">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
  </g>,
  tablerIconProps
);

const LiveCollaborationStatus = (props: ButtonProps) => {
  const appState = useUIAppState();
  const collaboratorsCount = appState?.collaborators?.size ?? 0;

  return (
    <Button style={{ position: 'relative' }} {...props}>
      {usersIcon}
      {<div className="CollabButton-collaborators">{collaboratorsCount}</div>}
    </Button>
  );
};

export default LiveCollaborationStatus;
