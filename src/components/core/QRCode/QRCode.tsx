import qrcode from 'qrcode';
import React, { FC, useEffect, useRef } from 'react';
import { makeStyles } from '@mui/styles';
import { useResizeDetector } from 'react-resize-detector';
import clsx from 'clsx';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

interface QRCodeProps {
  value: string | null;
  className?: string;
}

export const QRCode: FC<QRCodeProps> = ({ value, className }) => {
  const container = useRef<HTMLDivElement>(null);
  const styles = useStyles();

  const { height, width } = useResizeDetector({
    targetRef: container,
  });

  useEffect(() => {
    async function loadCanvas() {
      if (container.current && value && typeof height !== 'undefined' && typeof width !== 'undefined') {
        const canvas = await qrcode.toCanvas(value);
        const size = Math.min(height, width);
        canvas.style.height = `${size}px`;
        canvas.style.width = `${size}px`;
        container.current.append(canvas);
      }
    }

    loadCanvas();

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [value, container.current, height, width]);

  return <div ref={container} className={clsx(styles.container, className)} />;
};

export default QRCode;
