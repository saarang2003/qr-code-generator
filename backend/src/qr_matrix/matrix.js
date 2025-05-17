// /matrix/qrMatrix.js
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
    [1,1,1,1,1,1,1],
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
    [1,1,1,1,1],
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

function initializeMatrix() {
  const matrix = createEmptyMatrix(SIZE);
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, 0, SIZE - 7);
  addFinderPattern(matrix, SIZE - 7, 0);
  addAlignmentPattern(matrix, 22, 22);
  addTimingPatterns(matrix);

  // Reserve format info space
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
  matrix[SIZE - 8][8] = 1; // dark module

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
  return matrix[row][col] !== null && matrix[row][col] !== 0 && matrix[row][col] !== 1;
}

function placeDataBits(matrix, dataBits) {
  let size = matrix.length;
  let bitIndex = 0;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;

    const upward = ((size - 1 - col) / 2) % 2 === 0;
    let row = upward ? size - 1 : 0;
    const rowEnd = upward ? -1 : size;
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

module.exports = {
  initializeMatrix,
  codewordsToBits,
  placeDataBits
};
