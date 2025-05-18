import React, { useState } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [qrcode, setQrcode] = useState('');
  const [error, setError] = useState('');
  const [darkColor, setDarkColor] = useState('#000000ff');
  const [lightColor, setLightColor] = useState('#ffffffff');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('M');
  const [margin, setMargin] = useState(5);

  const generateQr = async () => {
    setError('');
    setQrcode('');

    if (!inputText) {
      setError('Please enter some text to generate a QR code.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          option: {
            color: { dark: darkColor, light: lightColor },
            errorCorrectionLevel,
            margin: parseInt(margin),
          },
        }),
      });

      const data = await response.json();
      response.ok ? setQrcode(data.qrCodeUrl) : setError(data.error || 'Something went wrong on the server.');
    } catch (err) {
      console.error('Error:', err);
      setError('Could not connect to the backend server.');
    }
  };

  return (
<div className="App">
  <header><h1>QR Code Generator</h1></header>
  <main>
    <div className="left-panel">
      <textarea
        placeholder="Enter text here to generate QR code"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <div className="options">
        <input type="text" placeholder="Dark Color" value={darkColor} onChange={(e) => setDarkColor(e.target.value)} />
        <input type="text" placeholder="Light Color" value={lightColor} onChange={(e) => setLightColor(e.target.value)} />
        <select value={errorCorrectionLevel} onChange={(e) => setErrorCorrectionLevel(e.target.value)}>
          <option value="L">L</option><option value="M">M</option><option value="Q">Q</option><option value="H">H</option>
        </select>
        <input type="number" placeholder="Margin" value={margin} onChange={(e) => setMargin(e.target.value)} />
      </div>
      <button onClick={generateQr}>Generate QR Code</button>
      {error && <p className="error-message">{error}</p>}
    </div>

    <div className="qr-display">
      {qrcode && <img src={qrcode} alt="QR Code" />}
    </div>
  </main>
</div>

  );
}

export default App;
