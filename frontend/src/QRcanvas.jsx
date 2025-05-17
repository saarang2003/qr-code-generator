import React, { useRef, useEffect } from 'react';

const QRCodeCanvas = ({ qrCodeMatrix, url }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!qrCodeMatrix || !Array.isArray(qrCodeMatrix) || !Array.isArray(qrCodeMatrix[0])) {
      console.error('Invalid QR code matrix:', qrCodeMatrix);
      return;
    }

    console.log('Matrix size:', qrCodeMatrix.length, qrCodeMatrix[0].length); // Should be 37x37

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = qrCodeMatrix.length;

    const moduleSize = 10;
    const padding = 10;
    canvas.width = size * moduleSize + 2 * padding;
    canvas.height = size * moduleSize + 2 * padding;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    qrCodeMatrix.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        ctx.fillStyle = cell === 1 ? '#000000' : '#FFFFFF';
        ctx.fillRect(
          colIndex * moduleSize + padding,
          rowIndex * moduleSize + padding,
          moduleSize,
          moduleSize
        );
      });
    });
  }, [qrCodeMatrix]);

  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <canvas ref={canvasRef} />
      </a>
    </div>
  );
};

export default QRCodeCanvas;