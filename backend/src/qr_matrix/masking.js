// masking.js

// 8 QR code mask patterns
const maskFunctions = [
  (r, c) => (r + c) % 2 === 0,
  (r, c) => r % 2 === 0,
  (r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2 + (r * c) % 3) === 0,
  (r, c) => (((r * c) % 2 + (r * c) % 3) % 2) === 0,
  (r, c) => (((r + c) % 2 + (r * c) % 3) % 2) === 0
];


function isReserved(matrix, row, col) {
  const size = matrix.length;

  // For example, let's assume reserved cells are the corners and timing patterns
  if ((row < 7 && col < 7) || (row < 7 && col >= size - 7) || (row >= size - 7 && col < 7)) {
    return true; // It's a reserved cell
  }

  return false;
}


// Apply a mask function to a deep copy of matrix
function applyMask(matrix, maskFunc) {
  const size = matrix.length;
  const masked = matrix.map(row => row.slice());

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isReserved(masked, r, c)) {
        if (maskFunc(r, c)) {
          masked[r][c] ^= 1; // invert bit
        }
      }
    }
  }
  return masked;
}

// Penalty rule: Count same color in a row or column
function calculatePenalty(matrix) {
  const size = matrix.length;
  let penalty = 0;

  // Rows
  for (let r = 0; r < size; r++) {
    let count = 1;
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === matrix[r][c - 1]) {
        count++;
        if (count === 5) penalty += 3;
        else if (count > 5) penalty++;
      } else {
        count = 1;
      }
    }
  }

  // Columns
  for (let c = 0; c < size; c++) {
    let count = 1;
    for (let r = 1; r < size; r++) {
      if (matrix[r][c] === matrix[r - 1][c]) {
        count++;
        if (count === 5) penalty += 3;
        else if (count > 5) penalty++;
      } else {
        count = 1;
      }
    }
  }

  return penalty;
}

// Try all masks and choose best
function chooseBestMask(matrix) {
  let minPenalty = Infinity;
  let bestMask = 0;
  let bestMatrix = null;

  for (let i = 0; i < 8; i++) {
    const masked = applyMask(matrix, maskFunctions[i]);
    const score = calculatePenalty(masked);
    if (score < minPenalty) {
      minPenalty = score;
      bestMask = i;
      bestMatrix = masked;
    }
  }

  return { bestMask, maskedMatrix: bestMatrix };
}

// Exporting the functions so that they can be used in other files
module.exports = {
  maskFunctions,
  applyMask,
  calculatePenalty,
  chooseBestMask
};
