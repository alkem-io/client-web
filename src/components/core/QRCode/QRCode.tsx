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
  const container = useRef<HTMLDivElement>(null);
  const styles = useStyles();

  const { height, width } = useResizeDetector({
    targetRef: container,
  });

  useEffect(() => {
    async function loadCanvas() {
      if (container.current && qrCodeJwt && typeof height !== 'undefined' && typeof width !== 'undefined') {
        const canvas = await qrcode.toCanvas(qrCodeJwt);
        const size = Math.min(height, width);
        canvas.style.height = `${size}px`;
        canvas.style.width = `${size}px`;
        container.current.append(canvas);
      } else if (container.current && qrCodeImg && typeof height !== 'undefined' && typeof width !== 'undefined') {
        //const image = <img src={qrCodeImg} alt='qr code' />;
        container.current.append(qrCodeImg);
      }
    }

    loadCanvas();

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [qrCodeJwt, qrCodeImg, container.current, height, width]);

  return <div ref={container} className={clsx(styles.container, className)} />;
};

export default QRCode;
