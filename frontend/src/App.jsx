import React, { useState } from 'react';
import QRCodeCanvas from './QRcanvas.jsx';

const App = () => {
  const [input, setInput] = useState('');
  const [qrCodeMatrix, setQrCodeMatrix] = useState(null);

  const handleGenerate = async () => {
    try {
      const response = await fetch('http://localhost:5000/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input, errorLevel: 'L' }),
      });
      const qrCodeData = await response.json();
      setQrCodeMatrix(qrCodeData.qrCode);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  return (
    <div>
      <h1>QR Code Generator</h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text or URL"
      />
      <button onClick={handleGenerate}>Generate QR Code</button>
      {qrCodeMatrix && <QRCodeCanvas qrCodeMatrix={qrCodeMatrix} />}
    </div>
  );
};

export default App;