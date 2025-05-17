// Byte Mode Encoder for QR Code (Version 3, Level Q)
function stringToBinary(str) {
  return str
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}

function encodeByteMode(input) {
  const modeIndicator = '0100'; // Byte mode
  const charCount = input.length;
  const charCountIndicator = charCount.toString(2).padStart(8, '0'); // Version 1–9 use 8 bits

  const dataBits = stringToBinary(input);
  let fullBitStream = modeIndicator + charCountIndicator + dataBits;

  // Add terminator (up to 4 bits, without exceeding max bit length)
  const maxBits = 272;
  const remainingBits = maxBits - fullBitStream.length;
  fullBitStream += '0'.repeat(Math.min(4, remainingBits));

  // Make the length a multiple of 8 (fill bits)
  while (fullBitStream.length % 8 !== 0) {
    fullBitStream += '0';
  }

  // Pad with alternate bytes 11101100 and 00010001
  const padBytes = ['11101100', '00010001'];
  let i = 0;
  while (fullBitStream.length < maxBits) {
    fullBitStream += padBytes[i % 2];
    i++;
  }

  return fullBitStream;
}

module.exports = { encodeByteMode };
