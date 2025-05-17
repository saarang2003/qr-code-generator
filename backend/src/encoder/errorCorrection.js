const rs = require('reedsolomon');

function bitStreamToCodewords(bitStream) {
  const codewords = [];
  for (let i = 0; i < bitStream.length; i += 8) {
    const byte = bitStream.slice(i, i + 8);
    codewords.push(parseInt(byte, 2));
  }
  return codewords;
}

function RS(messageLength, errorCorrectionLength) {
  const dataLength = messageLength - errorCorrectionLength;
  const encoder = new rs.ReedSolomonEncoder(rs.GenericGF.AZTEC_DATA_8());
  return {
    dataLength,
    messageLength,
    errorCorrectionLength,
    encode: function (message) {
      encoder.encode(message, errorCorrectionLength);
    }
  };
}

function generateECC(dataCodewords, eccLength) {
  const totalLength = dataCodewords.length + eccLength;
  const ec = RS(totalLength, eccLength);
  const message = new Int32Array(totalLength);
  for (let i = 0; i < dataCodewords.length; i++) {
    message[i] = dataCodewords[i];
  }
  ec.encode(message);
  return Array.from(message.slice(dataCodewords.length));
}

function interleaveCodewords(dataCodewords, eccCodewords) {
  const finalCodewords = [];
  const maxLen = Math.max(dataCodewords.length, eccCodewords.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < dataCodewords.length) {
      finalCodewords.push(dataCodewords[i]);
    }
    if (i < eccCodewords.length) {
      finalCodewords.push(eccCodewords[i]);
    }
  }
  return finalCodewords;
}

module.exports = { bitStreamToCodewords, generateECC, interleaveCodewords };