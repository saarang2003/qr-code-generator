// //  https://www.qrcode.com/ 

// Regular Expressions for Encoding Modes
const NUMERIC_RE = /^\d*$/;
const ALPHANUMERIC_RE = /^[\dA-Z $%*+\-./:]*$/;
const LATIN1_RE = /^[\x00-\xff]*$/;
const KANJI_RE = /^[\p{Script_Extensions=Han}\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}]*$/u;

// Function to Determine Encoding Mode
function getEncodingMode(string) {
  if (NUMERIC_RE.test(string)) {
    return 0b0001; // Numeric mode
  }
  if (ALPHANUMERIC_RE.test(string)) {
    return 0b0010; // Alphanumeric mode
  }
  if (LATIN1_RE.test(string)) {
    return 0b0100; // Byte mode (Latin-1)
  }
  if (KANJI_RE.test(string)) {
    return 0b1000; // Kanji mode
  }
  throw new Error("Unsupported encoding mode for the given input.");
}

// Example Usage
console.log(getEncodingMode("12345")); // Output: 1 (Numeric mode)
console.log(getEncodingMode("HELLO WORLD")); // Output: 2 (Alphanumeric mode)
console.log(getEncodingMode("https://example.com")); // Output: 4 (Byte mode)


// Length Bits Table
const LENGTH_BITS = [
    [10, 12, 14], // Numeric mode
    [9, 11, 13],  // Alphanumeric mode
    [8, 16, 16],  // Byte mode
    [8, 10, 12],  // Kanji mode
  ];
  
  // Function to Get Length Bits
  function getLengthBits(mode, version) {
    // Determine the index for the mode
    const modeIndex = 31 - Math.clz32(mode); // Faster than Math.log2
    // Determine the index for the version
    const bitsIndex = version > 26 ? 2 : version > 9 ? 1 : 0;
    return LENGTH_BITS[modeIndex][bitsIndex];
  }
  
  // Example Usage
  console.log(getLengthBits(0b0100, 2)); // Output: 8 (Byte mode, version 2)
  console.log(getLengthBits(0b0001, 10)); // Output: 12 (Numeric mode, version 10)

  // Function to Generate Byte Data
function getByteData(content, lengthBits, dataCodewords) {
    const data = new Uint8Array(dataCodewords);
    const rightShift = (4 + lengthBits) & 7;
    const leftShift = 8 - rightShift;
    const andMask = (1 << rightShift) - 1;
    const dataIndexStart = lengthBits > 12 ? 2 : 1;
  
    // Add encoding mode and content length
    data[0] = 64 /* Byte mode */ + (content.length >> (lengthBits - 4));
    if (lengthBits > 12) {
      data[1] = (content.length >> rightShift) & 255;
    }
    data[dataIndexStart] = (content.length & andMask) << leftShift;
  
    // Add content bytes
    for (let index = 0; index < content.length; index++) {
      const byte = content.charCodeAt(index);
      data[index + dataIndexStart] |= byte >> rightShift;
      data[index + dataIndexStart + 1] = (byte & andMask) << leftShift;
    }
  
    // Add padding bytes
    const remaining = dataCodewords - content.length - dataIndexStart - 1;
    for (let index = 0; index < remaining; index++) {
      const byte = index & 1 ? 17 : 236; // Alternating padding bytes
      data[index + content.length + 2] = byte;
    }
  
    return data;
  }
  
  // Example Usage
  console.log(getByteData('https://www.qrcode.com/', 8, 28));
  // Output: Uint8Array(28) [65, 166, 135, 71, 71, 7, 51, 162, 242, 247, 119, 119, ...]


  // Precompute Log and Exponent Tables for Galois Field (GF(256))
const LOG = new Uint8Array(256);
const EXP = new Uint8Array(256);
for (let exponent = 1, value = 1; exponent < 256; exponent++) {
  value = value > 127 ? ((value << 1) ^ 285) : value << 1;
  LOG[value] = exponent % 255;
  EXP[exponent % 255] = value;
}

// Function to Multiply Two Numbers in GF(256)
function mul(a, b) {
  return a && b ? EXP[(LOG[a] + LOG[b]) % 255] : 0;
}

// Function to Divide Two Numbers in GF(256)
function div(a, b) {
  return EXP[(LOG[a] + LOG[b] * 254) % 255];
}

// Function to Multiply Two Polynomials
function polyMul(poly1, poly2) {
  const coeffs = new Uint8Array(poly1.length + poly2.length - 1);
  for (let index = 0; index < coeffs.length; index++) {
    let coeff = 0;
    for (let p1index = 0; p1index <= index; p1index++) {
      const p2index = index - p1index;
      coeff ^= mul(poly1[p1index], poly2[p2index]);
    }
    coeffs[index] = coeff;
  }
  return coeffs;
}

// Example Usage
const poly1 = new Uint8Array([1, 2, 3]);
const poly2 = new Uint8Array([4, 5]);
console.log(polyMul(poly1, poly2)); // Output: Uint8Array([...])


// Function to Compute Polynomial Remainder
function polyRest(dividend, divisor) {
    const quotientLength = dividend.length - divisor.length + 1;
    let rest = new Uint8Array(dividend);
    for (let count = 0; count < quotientLength; count++) {
      if (rest[0]) {
        const factor = div(rest[0], divisor[0]);
        const subtr = new Uint8Array(rest.length);
        subtr.set(polyMul(divisor, [factor]), 0);
        rest = rest.map((value, index) => value ^ subtr[index]).slice(1);
      } else {
        rest = rest.slice(1);
      }
    }
    return rest;
  }
  
  // Example Usage
  const dividend = new Uint8Array([1, 2, 3, 4]);
  const divisor = new Uint8Array([1, 1]);
  console.log(polyRest(dividend, divisor)); // Output: Uint8Array([...])



  // Function to Generate Generator Polynomial
function getGeneratorPoly(degree) {
    let lastPoly = new Uint8Array([1]);
    for (let index = 0; index < degree; index++) {
      lastPoly = polyMul(lastPoly, new Uint8Array([1, EXP[index]]));
    }
    return lastPoly;
  }
  
  // Example Usage
  console.log(getGeneratorPoly(16));
  // Output: Uint8Array([...])


  // Function to Compute Error Correction Codewords
function getEDC(data, codewords) {
    const degree = codewords - data.length;
    const messagePoly = new Uint8Array(codewords);
    messagePoly.set(data, 0);
    return polyRest(messagePoly, getGeneratorPoly(degree));
  }
  
  // Example Usage
  const data = new Uint8Array([1, 2, 3, 4]);
  console.log(getEDC(data, 10)); // Output: Uint8Array([...])

  // Function to Get Matrix Size
function getSize(version) {
    return version * 4 + 17;
  }
  
  // Function to Create a New Matrix
  function getNewMatrix(version) {
    const size = version * 4 + 17;
    return Array.from({ length: size }, () => new Uint8Array(size).fill(0));
  }
  
  // Example Usage
  console.log(getSize(2)); // Output: 25 (for version 2)
  console.log(getNewMatrix(2)); // Output: 25x25 matrix filled with 0s

  // Function to Fill an Area in the Matrix
  function fillArea(matrix, row, column, width, height, fill = 1) {
    const fillRow = new Uint8Array(width).fill(fill);
    for (let index = row; index < row + height; index++) {
      if (matrix[index]) { // Ensure the row exists
        matrix[index].set(fillRow, column);
      }
    }
  }
  
  // Example Usage
  const matrix = getNewMatrix(2);
  fillArea(matrix, 0, 0, 9, 9); // Fill a 9x9 area starting at (0, 0)
  console.log(matrix);


  // Function to Place Fixed Patterns in the Matrix
  function placeFixedPatterns(matrix) {
    const size = matrix.length;
  
    // Finder Patterns
    [[0, 0], [size - 7, 0], [0, size - 7]].forEach(([row, col]) => {
      fillArea(matrix, row, col, 7, 7); // Outer square
      fillArea(matrix, row + 1, col + 1, 5, 5, 0); // Inner white square
      fillArea(matrix, row + 2, col + 2, 3, 3); // Inner black square
    });
  
    // Separators
    fillArea(matrix, 7, 0, 8, 1, 0);
    fillArea(matrix, 0, 7, 1, 8, 0);
    fillArea(matrix, size - 8, 0, 8, 1, 0);
    fillArea(matrix, 0, size - 8, 1, 8, 0);
    fillArea(matrix, 7, size - 8, 8, 1, 0);
    fillArea(matrix, size - 7, 7, 1, 8, 0);
  
    // Timing Patterns
    for (let pos = 8; pos < size - 8; pos += 2) {
      matrix[6][pos] = 1;
      matrix[pos][6] = 1;
    }
  
    // Dark Module
    matrix[size - 8][8] = 1;
  }

  // Function to Place Alignment Patterns in the Matrix
function placeAlignmentPatterns(matrix, version) {
  const alignmentTracks = getAlignmentTracks(version);
  const lastTrack = alignmentTracks.length - 1;

  alignmentTracks.forEach((row, rowIndex) => {
    alignmentTracks.forEach((column, columnIndex) => {
      // Skip alignment patterns near finder patterns
      if (
        (rowIndex === 0 && (columnIndex === 0 || columnIndex === lastTrack)) ||
        (columnIndex === 0 && rowIndex === lastTrack)
      ) {
        return;
      }
      fillArea(matrix, row - 2, column - 2, 5, 5); // Outer square
      fillArea(matrix, row - 1, column - 1, 3, 3, 0); // Inner white square
      matrix[row][column] = 1; // Center black module
    });
  });
}

// Function to Get Alignment Tracks
function getAlignmentTracks(version) {
  if (version === 1) {
    return []; // No alignment patterns for version 1
  }
  const intervals = Math.floor(version / 7) + 1;
  const distance = 4 * version + 4; // Distance between first and last pattern
  const step = Math.ceil(distance / intervals / 2) * 2;
  return [6].concat(
    Array.from({ length: intervals }, (_, index) => distance + 6 - (intervals - 1 - index) * step)
  );
}

  // Function to Generate Module Sequence
function getModuleSequence(version) {
    const matrix = getNewMatrix(version);
    const size = getSize(version);
  
    // Place fixed patterns
    placeFixedPatterns(matrix);
    placeAlignmentPatterns(matrix, version);
  
    // Generate sequence
    let rowStep = -1;
    let row = size - 1;
    let column = size - 1;
    const sequence = [];
    let index = 0;
  
    while (column >= 0) {
      if (matrix[row][column] === 0) {
        sequence.push([row, column]);
      }
      // Move to the next module
      if (index & 1) {
        row += rowStep;
        if (row === -1 || row === size) {
          rowStep = -rowStep;
          row += rowStep;
          column -= column === 7 ? 2 : 1;
        } else {
          column++;
        }
      } else {
        column--;
      }
      index++;
    }
    return sequence;
  }
  
  // Example Usage
  console.log(getModuleSequence(2));
  // Output: Array of module coordinates for version 2


  // Masking Functions
const MASK_FNS = [
    (row, column) => ((row + column) & 1) === 0,
    (row, column) => (row & 1) === 0,
    (row, column) => column % 3 === 0,
    (row, column) => (row + column) % 3 === 0,
    (row, column) => (((row >> 1) + Math.floor(column / 3)) & 1) === 0,
    (row, column) => ((row * column) & 1) + ((row * column) % 3) === 0,
    (row, column) => ((((row * column) & 1) + ((row * column) % 3)) & 1) === 0,
    (row, column) => ((((row + column) & 1) + ((row * column) % 3)) & 1) === 0,
  ];
  
  // Function to Apply Mask to the Matrix
  function getMaskedMatrix(version, codewords, maskIndex) {
    const sequence = getModuleSequence(version);
    const matrix = getNewMatrix(version);
  
    sequence.forEach(([row, column], index) => {
      const codeword = codewords[index >> 3];
      const bitShift = 7 - (index & 7);
      const moduleBit = (codeword >> bitShift) & 1;
      matrix[row][column] = moduleBit ^ MASK_FNS[maskIndex](row, column);
    });
  
    return matrix;
  }
  
  // Example Usage
  const version = 2;
  const codewords = new Uint8Array([65, 166, 135, 71, 71, 7, 51, 162, 242, 247]);
  const maskIndex = 0;
  console.log(getMaskedMatrix(version, codewords, maskIndex));


  // Function to Generate Format Information
function getFormatModules(errorLevel, maskIndex) {
    const EDC_ORDER = 'MLHQ';
    const FORMAT_DIVISOR = new Uint8Array([1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1]);
    const FORMAT_MASK = new Uint8Array([1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0]);
  
    const formatPoly = new Uint8Array(15);
    const errorLevelIndex = EDC_ORDER.indexOf(errorLevel);
    formatPoly[0] = errorLevelIndex >> 1;
    formatPoly[1] = errorLevelIndex & 1;
    formatPoly[2] = maskIndex >> 2;
    formatPoly[3] = (maskIndex >> 1) & 1;
    formatPoly[4] = maskIndex & 1;
  
    const rest = polyRest(formatPoly, FORMAT_DIVISOR);
    formatPoly.set(rest, 5);
  
    const maskedFormatPoly = formatPoly.map(
      (bit, index) => bit ^ FORMAT_MASK[index]
    );
  
    return maskedFormatPoly;
  }
  
  // Function to Place Format Information in the Matrix
  function placeFormatModules(matrix, errorLevel, maskIndex) {
    const formatModules = getFormatModules(errorLevel, maskIndex);
    const size = matrix.length;
  
    // Top-left corner
    matrix[8].set(formatModules.subarray(0, 6), 0);
    matrix[8].set(formatModules.subarray(6, 8), 7);
    matrix[8].set(formatModules.subarray(7), size - 8);
    matrix[7][8] = formatModules[8];
  
    // Bottom-left and top-right corners
    formatModules.subarray(0, 7).forEach(
      (cell, index) => (matrix[size - index - 1][8] = cell)
    );
    formatModules.subarray(9).forEach(
      (cell, index) => (matrix[5 - index][8] = cell)
    );
  }
  

  placeFormatModules( getNewMatrix(2), 'L', 0);
  console.log( getNewMatrix(2));


  // Rule 1: Penalty for consecutive modules of the same color
function getLinePenalty(line) {
    let count = 0;
    let counting = 0; // Tracks the current module color
    let penalty = 0;
    for (const cell of line) {
      if (cell !== counting) {
        counting = cell;
        count = 1;
      } else {
        count++;
        if (count === 5) {
          penalty += 3;
        } else if (count > 5) {
          penalty++;
        }
      }
    }
    return penalty;
  }
  
  // Rule 2: Penalty for 2x2 blocks of modules of the same color
  function getBlockPenalty(matrix) {
    let blocks = 0;
    const size = matrix.length;
    for (let row = 0; row < size - 1; row++) {
      for (let column = 0; column < size - 1; column++) {
        const module = matrix[row][column];
        if (
          matrix[row][column + 1] === module &&
          matrix[row + 1][column] === module &&
          matrix[row + 1][column + 1] === module
        ) {
          blocks++;
        }
      }
    }
    return blocks * 3;
  }
  
  // Rule 3: Penalty for patterns resembling "1011101" or its reverse
  const RULE_3_PATTERN = new Uint8Array([1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0]);
  const RULE_3_REVERSED_PATTERN = RULE_3_PATTERN.slice().reverse();
  
  function getPatternPenalty(matrix) {
    let patterns = 0;
    const size = matrix.length;
    for (let index = 0; index < size; index++) {
      const row = matrix[index];
      for (let columnIndex = 0; columnIndex < size - 11; columnIndex++) {
        if ([RULE_3_PATTERN, RULE_3_REVERSED_PATTERN].some(
          pattern => pattern.every(
            (cell, ptr) => cell === row[columnIndex + ptr]
          )
        )) {
          patterns++;
        }
      }
      for (let rowIndex = 0; rowIndex < size - 11; rowIndex++) {
        if ([RULE_3_PATTERN, RULE_3_REVERSED_PATTERN].some(
          pattern => pattern.every(
            (cell, ptr) => cell === matrix[rowIndex + ptr][index]
          )
        )) {
          patterns++;
        }
      }
    }
    return patterns * 40;
  }
  
  // Rule 4: Penalty for unbalanced dark and light modules
  function getBalancePenalty(matrix) {
    const totalModules = matrix.length * matrix.length;
    const darkModules = matrix.reduce(
      (sum, line) => sum + line.reduce((lineSum, cell) => lineSum + cell, 0),
      0
    );
    const percentage = (darkModules * 100) / totalModules;
    const roundedPercentage = percentage > 50
      ? Math.floor(percentage / 5) * 5
      : Math.ceil(percentage / 5) * 5;
    return Math.abs(roundedPercentage - 50) * 2;
  }
  
  // Function to Calculate Total Penalty Score
  function getPenaltyScore(matrix) {
    return (
      matrix.reduce((sum, row) => sum + getLinePenalty(row), 0) + // Rule 1 (rows)
      matrix.reduce((sum, _, columnIndex) => { // Rule 1 (columns)
        const column = matrix.map(row => row[columnIndex]);
        return sum + getLinePenalty(column);
      }, 0) +
      getBlockPenalty(matrix) + // Rule 2
      getPatternPenalty(matrix) + // Rule 3
      getBalancePenalty(matrix) // Rule 4
    );
  }
  
  // Example Usage
  const exampleMatrix = getNewMatrix(2);
  placeFixedPatterns(exampleMatrix);
  console.log(getPenaltyScore(exampleMatrix));

  function getMaskedQRCode(version, codewords, errorLevel, maskIndex) {
    const matrix = getNewMatrix(version);
  
    // Place fixed patterns
    placeFixedPatterns(matrix);
  
    // Place alignment patterns
    placeAlignmentPatterns(matrix, version);
  
    // Apply mask and fill data
    return getMaskedMatrix(version, codewords, maskIndex);
  }


  // Function to Select the Optimal Mask
function getOptimalMask(version, codewords, errorLevel) {
    let bestMatrix;
    let bestScore = Infinity;
    let bestMask = -1;
  
    for (let index = 0; index < 8; index++) {
      const matrix = getMaskedQRCode(version, codewords, errorLevel, index);
      const penaltyScore = getPenaltyScore(matrix);
      if (penaltyScore < bestScore) {
        bestScore = penaltyScore;
        bestMatrix = matrix;
        bestMask = index;
      }
    }
  
    return [bestMatrix, bestMask];
  }
  
  // Example Usage
//   const version = 2;
//   const codewords = new Uint8Array([65, 166, 135, 71, 71, 7, 51, 162, 242, 247]);
//   const errorLevel = 'L';
//   console.log(getOptimalMask(version, codewords, errorLevel));


function getCodewords(content, minErrorLevel) {
  const encodingMode = getEncodingMode(content);
  const errorLevel = minErrorLevel || 'L';

  // Dynamically calculate the version based on content length
  let version = 1;
  while (getSize(version) * getSize(version) < content.length * 8 + 72) {
    version++;
  }

  const lengthBits = getLengthBits(encodingMode, version);
  const dataCodewords = getSize(version) - 17; // Adjust for version
  const rawData = getByteData(content, lengthBits, dataCodewords);
  const codewords = getEDC(rawData, dataCodewords + 10); // Adjust for error correction

  return { codewords, version, errorLevel, encodingMode };
}

  // Function to Generate the QR Code
function getQRCode(content, minErrorLevel = 'L') {
    // Step 1: Get codewords and metadata
    const { codewords, version, errorLevel, encodingMode } = getCodewords(content, minErrorLevel);
  
    // Step 2: Select the optimal mask
    const [qrCode, maskIndex] = getOptimalMask(version, codewords, errorLevel);
  
    // Step 3: Return the QR code matrix and metadata
    return {
      qrCode,       // The QR code matrix
      version,      // QR code version
      errorLevel,   // Error correction level
      encodingMode, // Encoding mode used
      codewords,    // Data and error correction codewords
      maskIndex     // Mask index used
    };
  }
  
  // Example Usage
  const qrCodeData = getQRCode('https://www.qrcode.com/', 'L');
  console.log(qrCodeData.qrCode); // Output: QR code matrix
  console.log(`Version: ${qrCodeData.version}`);
  console.log(`Error Level: ${qrCodeData.errorLevel}`);
  console.log(`Mask Index: ${qrCodeData.maskIndex}`);

  export { getQRCode };