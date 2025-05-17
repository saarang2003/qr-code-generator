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

function isReservedForMasking(matrix, row, col) {
  const size = matrix.length;
  if (
    (row < 7 && col < 7) ||
    (row < 7 && col >= size - 7) ||
    (row >= size - 7 && col < 7) ||
    (row >= 20 && row <= 24 && col >= 20 && col <= 24) ||
    (row === 6 || col === 6) ||
    (row === 8 && col <= 8) ||
    (col === 8 && row <= 8) ||
    (row === 8 && col >= size - 8) ||
    (col === 8 && row >= size - 8) ||
    (row === size - 8 && col === 8)
  ) return true;
  return false;
}

function applyMask(matrix, maskFunc) {
  const size = matrix.length;
  const masked = matrix.map(row => row.slice());
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isReservedForMasking(masked, r, c)) {
        if (maskFunc(r, c)) {
          masked[r][c] ^= 1;
        }
      }
    }
  }
  return masked;
}

function calculatePenalty(matrix) {
  const size = matrix.length;
  let penalty = 0;
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

function addQuietZone(matrix) {
  const quietZoneSize = 4;
  const sizeWithQuietZone = matrix.length + quietZoneSize * 2;
  const newMatrix = Array(sizeWithQuietZone).fill().map(() => Array(sizeWithQuietZone).fill(0));
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      newMatrix[row + quietZoneSize][col + quietZoneSize] = matrix[row][col];
    }
  }
  return newMatrix;
}

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

module.exports = {
  maskFunctions,
  applyMask,
  calculatePenalty,
  chooseBestMask,
  addQuietZone
};