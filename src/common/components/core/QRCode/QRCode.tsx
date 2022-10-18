import React, { FC, useEffect, useRef } from 'react';
import { makeStyles } from '@mui/styles';
import { useResizeDetector } from 'react-resize-detector';
import clsx from 'clsx';
import qrcode from 'qrcode';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

interface QRCodeProps {
  qrCodeJwt?: string | null;
  qrCodeImg?: string | null;
  className?: string;
}

export const QRCode: FC<QRCodeProps> = ({ qrCodeJwt, qrCodeImg, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const styles = useStyles();

  const { height, width } = useResizeDetector({
    targetRef: containerRef,
  });

  useEffect(() => {
    const container = containerRef.current;

    async function loadCanvas() {
      if (container && qrCodeJwt && typeof height !== 'undefined' && typeof width !== 'undefined') {
        const canvas = await qrcode.toCanvas(qrCodeJwt);
        const size = Math.min(height, width);
        canvas.style.height = `${size}px`;
        canvas.style.width = `${size}px`;
        container.append(canvas);
      } else if (container && qrCodeImg && typeof height !== 'undefined' && typeof width !== 'undefined') {
        const size = Math.min(height, width);
        container.innerHTML = `<img src ='${qrCodeImg}' alt='qr code' height='${size}px' width =  '${size}px' />`;
      }
    }

    loadCanvas();

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [qrCodeJwt, qrCodeImg, height, width]);

  return <div ref={containerRef} className={clsx(styles.container, className)} />;
};

export default QRCode;
