import React from 'react'
import { useState } from 'react'

function App() {
  const [inputtext , setInputText] = useState('');
  const [qrcode ,setQrcode] = useState('');
  const [error , setError] = useState('');
  const [darkColor , setDarkColor] = useState('#000000ff');
  const [lightColor , setLightColor] = useState('#ffffffff');
  const [errorCorrectioLevel , setErrorCorrectioLevel] = useState('M');
  const [margin , getMargin] = useState(5);


  const generateQr = async () =>{
    setError('');
    setQrcode('');

    if(!inputtext){
       setError('Please enter some text to generate a QR code.');
      return;
    }

    try {
      
      const response = await fetch('http://localhost:5000/generate-qr' , {
        method : 'POST',
        headers : {
          'Content-Type' :'application/json',
        },
        body  : JSON.stringify({
          text : inputtext,
          option : {
             color: {
              dark: darkColor,
              light: lightColor,
            },
            errorCorrectioLevel : errorCorrectioLevel,
            margin : parseInt(margin),
          }
        })
      })

      const data = await response.json();

      if (response.ok) {
        setQrcode(data.qrCodeUrl);
      } else {
        setError(data.error || 'Something went wrong on the server.');
      }
    } catch (error) {
       console.error('Error fetching QR code:', error);
      setError('Could not connect to the backend server. Please ensure it is running.');
    }
  }

  return (
   <div className="App">
      <header className="App-header">
        <h1>QR Code Generator</h1>
      </header>
      <main>
        <div className="input-section">
          <textarea
            placeholder="Enter text here to generate QR code"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows="5"
            cols="50"
          />
          <div className="options">
            <label>
              Dark Color (RGBA Hex):
              <input
                type="text"
                value={darkColor}
                onChange={(e) => setDarkColor(e.target.value)}
              />
            </label>
            <label>
              Light Color (RGBA Hex):
              <input
                type="text"
                value={lightColor}
                onChange={(e) => setLightColor(e.target.value)}
              />
            </label>
            <label>
              Error Correction Level:
              <select
                value={errorCorrectionLevel}
                onChange={(e) => setErrorCorrectionLevel(e.target.value)}
              >
                <option value="L">L (Low)</option>
                <option value="M">M (Medium)</option>
                <option value="Q">Q (Quartile)</option>
                <option value="H">H (High)</option>
              </select>
            </label>
            <label>
              Margin:
              <input
                type="number"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                min="0"
              />
            </label>
          </div>
          <button onClick={generateQrCode}>Generate QR Code</button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {qrCodeUrl && (
          <div className="qr-code-display">
            <h2>Generated QR Code:</h2>
            <img src={qrCodeUrl} alt="Generated QR Code" />
            <p>Right-click and "Save Image As..." to download.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App