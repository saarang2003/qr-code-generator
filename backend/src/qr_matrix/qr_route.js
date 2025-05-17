const express = require('express');
const { encodeByteMode } = require('../encoder/byteEncoder');
const { bitStreamToCodewords, generateECC, interleaveCodewords } = require('../encoder/errorCorrection');
const { codewordsToBits, initializeMatrix, placeDataBits } = require('./matrix');
const { chooseBestMask, addQuietZone } = require('./masking');

const router = express.Router();

router.post('/', (req, res) => {
  const { content, errorLevel } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const bitStream = encodeByteMode(content);
    const dataCodewords = bitStreamToCodewords(bitStream);
    const eccLength = 43; // Version 3, Level Q
    const ecc = generateECC(dataCodewords, eccLength);
    const finalCodewords = interleaveCodewords(dataCodewords, ecc);
    const dataBits = codewordsToBits(finalCodewords);
    // First initialize with mask 0, then re-initialize with the best mask
    let matrix = initializeMatrix(0);
    matrix = placeDataBits(matrix, dataBits);
    const { bestMask, maskedMatrix } = chooseBestMask(matrix);
    // Re-initialize matrix with the correct mask pattern
    matrix = initializeMatrix(bestMask);
    matrix = placeDataBits(matrix, dataBits);
    // Apply the chosen mask
    const finalMatrix = addQuietZone(maskedMatrix);
    res.json({ qrCode: finalMatrix });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

module.exports = router;