import React, { useState } from 'react';
import QRCodeCanvas from './QRcanvas.jsx';

const App = () => {
  const [input, setInput] = useState('');
  const [qrCodeMatrix, setQrCodeMatrix] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!input) {
      setError('Please enter a URL');
      return;
    }
    setError('');
    try {
      const response = await fetch('http://localhost:5000/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input, errorLevel: 'Q' }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }
      const qrCodeData = await response.json();
      setQrCodeMatrix(qrCodeData.qrCode);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Failed to generate QR code. Please try again.');
    }
  };

  return (
    <div>
      <h1>QR Code Generator</h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter URL (e.g., https://example.com)"
      />
      <button onClick={handleGenerate}>Generate QR Code</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {qrCodeMatrix && <QRCodeCanvas qrCodeMatrix={qrCodeMatrix} url={input} />}
    </div>
  );
};

export default App;