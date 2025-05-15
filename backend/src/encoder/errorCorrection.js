const { ReedSolomon } = require('@bnb-chain/reed-solomon');

// Convert bit stream into 8-bit codewords
function bitStreamToCodewords(bitStream) {
  const codewords = [];
  for (let i = 0; i < bitStream.length; i += 8) {
    const byte = bitStream.slice(i, i + 8);
    codewords.push(parseInt(byte, 2));
  }
  return codewords;
}

// Generate ECC using Reed-Solomon encoding
async function generateECC(dataCodewords) {
  const rs = new ReedSolomon();
  const ecc = await rs.encode(Uint8Array.from(dataCodewords));
  return Array.from(ecc);
}

module.exports = { bitStreamToCodewords, generateECC };
