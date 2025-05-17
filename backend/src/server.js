
const { encodeByteMode } = require('./encoder/byteEncoder');
const { bitStreamToCodewords, generateECC, interleaveCodewords } = require('./encoder/errorCorrection');
const { chooseBestMask } = require('./qr_matrix/masking');
const { codewordsToBits, initializeMatrix, placeDataBits } = require('./qr_matrix/matrix');

const input = 'https://example.com';
const bitStream = encodeByteMode(input);
const dataCodewords = bitStreamToCodewords(bitStream);

console.log('Data Codewords Length:', dataCodewords.length);

// Determine ECC length based on QR version and error correction level
const eccLength = 43; // Example value for Version 3, Level q

const ecc = generateECC(dataCodewords, eccLength);

console.log('Data Codewords:', dataCodewords);
console.log('ECC Codewords:', ecc);

const finalCodewords = interleaveCodewords(dataCodewords, ecc);
console.log('Final Codewords for QR Matrix:', finalCodewords);
 

// Generate full matrix
const dataBits = codewordsToBits(finalCodewords);
const matrix = initializeMatrix();
const finalMatrix = placeDataBits(matrix, dataBits);

console.log('Final QR Matrix:');
console.table(finalMatrix);


 const { bestMask, maskedMatrix } = chooseBestMask(finalMatrix);
 console.log("Masked matrix");
 console.log("bestMask" , bestMask);
 console.log("masked matrix " , maskedMatrix);
