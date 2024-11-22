import { useEffect, useRef } from 'react';
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

type QRCodeProps = {
  qrCodeJwt?: string | null;
  qrCodeImg?: string | null;
  className?: string;
};

export const QRCode = ({ qrCodeJwt, qrCodeImg, className }: QRCodeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const styles = useStyles();

  const { height, width } = useResizeDetector({ targetRef: containerRef });

  useEffect(() => {
    const container = containerRef.current;

    async function loadWhiteboard() {
      if (container && qrCodeJwt && typeof height !== 'undefined' && typeof width !== 'undefined') {
        const whiteboard = await qrcode.toCanvas(qrCodeJwt);
        const size = Math.min(height, width);
        whiteboard.style.height = `${size}px`;
        whiteboard.style.width = `${size}px`;
        container.append(whiteboard);
      } else if (container && qrCodeImg && typeof height !== 'undefined' && typeof width !== 'undefined') {
        const size = Math.min(height, width);
        container.innerHTML = `<img src ='${qrCodeImg}' alt='qr code' height='${size}px' width =  '${size}px' />`;
      }
    }

    loadWhiteboard();

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [qrCodeJwt, qrCodeImg, height, width]);

  return <div ref={containerRef} className={clsx(styles.container, className)} />;
};

export default QRCode;
