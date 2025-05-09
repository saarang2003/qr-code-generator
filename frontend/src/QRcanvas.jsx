import React, { useRef, useEffect } from 'react';

const QRCodeCanvas = ({ qrCodeMatrix }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!Array.isArray(qrCodeMatrix) || !Array.isArray(qrCodeMatrix[0])) {
      console.error('Invalid QR code matrix:', qrCodeMatrix);
      return;
    }

    if (qrCodeMatrix && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const size = qrCodeMatrix.length;

      // Set canvas size
      canvas.width = size * 10 + 20; // Add padding
      canvas.height = size * 10 + 20;

      const moduleSize = 10; // Size of each QR code module
const padding = 10; // Padding around the QR code

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the QR code with padding
      ctx.fillStyle = '#FFFFFF'; // Background color
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill background

      qrCodeMatrix.forEach((row, rowIndex) => {
        const rowArray = Object.values(row); // Convert object to array
        rowArray.forEach((cell, colIndex) => {
          ctx.fillStyle = cell ? '#000000' : '#FFFFFF'; // Black for 1, White for 0
          ctx.fillRect(
            colIndex * moduleSize + padding,
      rowIndex * moduleSize + padding,
      moduleSize,
      moduleSize
          ); // Add padding
        });
      });
    }
  }, [qrCodeMatrix]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
       <a href={qrCodeMatrix ? 'https://example.com' : '#'} target="_blank" rel="noopener noreferrer"></a>
      <canvas
        ref={canvasRef}
        style={{
          border: '2px solid #000',
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      />
    </div>
  );
};

export default QRCodeCanvas;