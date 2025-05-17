const rs = require('reedsolomon');

// Convert bit stream into 8-bit codewords
function bitStreamToCodewords(bitStream) {
  const codewords = [];
  for (let i = 0; i < bitStream.length; i += 8) {
    const byte = bitStream.slice(i, i + 8);
    codewords.push(parseInt(byte, 2));
  }
  return codewords;
}

function RS(messageLength, errorCorrectionLength) {
	var dataLength = messageLength - errorCorrectionLength;
	var encoder = new rs.ReedSolomonEncoder(rs.GenericGF.AZTEC_DATA_8());
	var decoder = new rs.ReedSolomonDecoder(rs.GenericGF.AZTEC_DATA_8());
	return {
		dataLength: dataLength,
		messageLength: messageLength,
		errorCorrectionLength: errorCorrectionLength,

		encode : function (message) {
			encoder.encode(message, errorCorrectionLength);
		},

		decode: function (message) {
			decoder.decode(message, errorCorrectionLength);
		}
	};
}

// Generate ECC using Reed-Solomon encoding
function generateECC(dataCodewords, eccLength) {
  const totalLength = dataCodewords.length + eccLength;

  const ec = RS(totalLength, eccLength);
  const message = new Int32Array(totalLength);

  for (let i = 0; i < dataCodewords.length; i++) {
    message[i] = dataCodewords[i];
  }
console.log('raw data');
console.log(Array.prototype.join.call(message));
//=> 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0,0,0,0,0,0,0,0

ec.encode(message);

console.log('rs coded');
console.log(Array.prototype.join.call(message));
//=> 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,180,183,0,112,111,203,47,126
  const ecc = Array.from(message.slice(dataCodewords.length));
  return ecc;
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

module.exports = { bitStreamToCodewords, generateECC  , interleaveCodewords};
