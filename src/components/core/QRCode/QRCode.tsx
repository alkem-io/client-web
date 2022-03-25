import React, { FC, useEffect, useRef } from 'react';
import qrcode from 'qrcode';

export const QRCode: FC<{ jwt?: string | null; qrCode?: string | null }> = ({ jwt, qrCode }) => {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    async function loadCanvas() {
      if (container.current && jwt) {
        const canvas = await qrcode.toCanvas(jwt);
        container.current.innerHTML = '';
        container.current.append(canvas);
      } else if (container.current && qrCode) {
        <img src={qrCode} />;
      }
    }

    loadCanvas();
  }, [jwt, qrCode, container]);

  return <div ref={container} style={{ display: 'flex', justifyContent: 'center' }} />;
};

export default QRCode;
