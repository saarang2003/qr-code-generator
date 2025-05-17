const SIZE = 29; // Version 3 QR code

function createEmptyMatrix(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function addFinderPattern(matrix, row, col) {
  const pattern = [
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1]
  ];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      matrix[row + r][col + c] = pattern[r][c];
    }
  }
}

function addAlignmentPattern(matrix, row, col) {
  const pattern = [
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1]
  ];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      matrix[row - 2 + r][col - 2 + c] = pattern[r][c];
    }
  }
}

function addTimingPatterns(matrix) {
  for (let i = 8; i < SIZE - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }
}

function applyBCH(format) {
  const formatBits = parseInt(format, 2);
  const generator = 0b10100110111; // BCH polynomial for QR format info
  let data = formatBits << 10;
  for (let i = 14; i >= 10; i--) {
    if ((data >> i) & 1) {
      data ^= generator << (i - 10);
    }
  }
  const errorCorrection = data & 0b1111111111;
  const result = (formatBits << 10) | errorCorrection;
  return result.toString(2).padStart(15, '0');
}

function getFormatBits(errorCorrectionLevel = 'Q', maskPattern = 0) {
  const formatStringMap = { 'Q': '11' };
  const ecc = formatStringMap[errorCorrectionLevel];
  const format = ecc + maskPattern.toString(2).padStart(3, '0');
  return applyBCH(format);
}

function placeFormatInfo(matrix, formatBits) {
  const bits = formatBits.split('').map(Number);
  for (let i = 0; i < 6; i++) matrix[8][i] = bits[i];
  matrix[8][7] = bits[6];
  matrix[8][8] = bits[7];
  matrix[7][8] = bits[8];
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = bits[i];
  for (let i = 0; i < 8; i++) {
    matrix[8][SIZE - 1 - i] = bits[i];
  }
  for (let i = 0; i < 7; i++) {
    matrix[SIZE - 1 - i][8] = bits[8 + i];
  }
}

function initializeMatrix(maskPattern = 0) {
  const matrix = createEmptyMatrix(SIZE);
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, 0, SIZE - 7);
  addFinderPattern(matrix, SIZE - 7, 0);
  addAlignmentPattern(matrix, 22, 22);
  addTimingPatterns(matrix);

  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      matrix[8][i] = -1;
      matrix[i][8] = -1;
    }
  }
  for (let i = SIZE - 8; i < SIZE; i++) {
    matrix[8][i] = -1;
    matrix[i][8] = -1;
  }
  matrix[SIZE - 8][8] = 1; // Dark module

  const formatBits = getFormatBits('Q', maskPattern);
  placeFormatInfo(matrix, formatBits);

  return matrix;
}

function codewordsToBits(codewords) {
  const bits = [];
  for (const cw of codewords) {
    for (let i = 7; i >= 0; i--) {
      bits.push((cw >> i) & 1);
    }
  }
  return bits;
}

function isReserved(matrix, row, col) {
  if (!matrix[row] || matrix[row][col] === undefined) return true;
  // Protect finder patterns, alignment patterns, timing patterns, format info, dark module
  if (
    (row < 7 && col < 7) || // Top-left finder
    (row < 7 && col >= SIZE - 7) || // Top-right finder
    (row >= SIZE - 7 && col < 7) || // Bottom-left finder
    (row >= 20 && row <= 24 && col >= 20 && col <= 24) || // Alignment pattern
    (row === 6 || col === 6) || // Timing patterns
    (row === 8 && col <= 8) || // Format info
    (col === 8 && row <= 8) ||
    (row === 8 && col >= SIZE - 8) ||
    (col === 8 && row >= SIZE - 8) ||
    (row === SIZE - 8 && col === 8) // Dark module
  ) return true;
  return matrix[row][col] !== null && matrix[row][col] !== 0 && matrix[row][col] !== 1;
}

function placeDataBits(matrix, dataBits) {
  let bitIndex = 0;
  for (let col = SIZE - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    const upward = ((SIZE - 1 - col) / 2) % 2 === 0;
    let row = upward ? SIZE - 1 : 0;
    const rowEnd = upward ? -1 : SIZE;
    const step = upward ? -1 : 1;
    for (; row !== rowEnd; row += step) {
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c;
        if (!isReserved(matrix, row, currentCol)) {
          matrix[row][currentCol] = bitIndex < dataBits.length ? dataBits[bitIndex++] : 0;
        }
      }
    }
  }
  return matrix;
}

function printMatrix(matrix) {
  for (const row of matrix) {
    console.log(row.map(cell => {
      if (cell === 1) return "█";
      if (cell === 0) return " ";
      return ".";
    }).join(""));
}
}

module.exports = {
  initializeMatrix,
  codewordsToBits,
  placeDataBits,
  printMatrix
};