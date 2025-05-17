const express = require('express');
const cors = require('cors');
const qrRoute = require('./qr_matrix/qr_route');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/generate-qr', qrRoute);

app.listen(5000, () => console.log('Server running on port 5000'));