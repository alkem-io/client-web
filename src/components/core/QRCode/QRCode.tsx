import qrcode from 'qrcode';
import React, { FC, useEffect, useRef } from 'react';

export const QRCode: FC<{ value?: string | null }> = ({ value }) => {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    async function loadCanvas() {
      if (container.current && value) {
        const canvas = await qrcode.toCanvas(value);
        container.current.innerHTML = '';
        container.current.append(canvas);
      }
    }

    loadCanvas();
  }, [value, container]);

  return <div ref={container} style={{ display: 'flex', justifyContent: 'center' }} />;
};

export default QRCode;
