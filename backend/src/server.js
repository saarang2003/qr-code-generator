
import express from 'express';
import { getQRCode } from '../main.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/generate-qr', (req, res) => {
    const { content, errorLevel } = req.body;
    console.log('Received content:', content);
    const formattedContent = content.startsWith('http') ? content : `https://${content}`;
    console.log('Encoded Content:', formattedContent);
    const qrCodeData = getQRCode(formattedContent, errorLevel || 'L');
    qrCodeData.qrCode = qrCodeData.qrCode.map(row => Array.from(row)); // Convert Uint8Array to array
    res.json(qrCodeData);
  console.log(qrCodeData.qrCode);
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));