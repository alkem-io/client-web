import { Box, SxProps, Theme } from '@mui/material';
import qrcode from 'qrcode';
import { useEffect, useRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';

type QRCodeProps = {
  qrCodeJwt?: string | null;
  qrCodeImg?: string | null;
  sx?: SxProps<Theme>;
};

export const QRCode = ({ qrCodeJwt, qrCodeImg, sx }: QRCodeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
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
        const img = document.createElement('img');
        img.src = qrCodeImg;
        img.alt = 'qr code';
        img.height = size;
        img.width = size;
        container.appendChild(img);
      }
    }

    loadWhiteboard();

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [qrCodeJwt, qrCodeImg, height, width]);

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', ...sx }}
      ref={containerRef}
    />
  );
};

export default QRCode;
