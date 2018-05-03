'use strict';

const MAX_POWER = 5000;
const MAX_DURATION = 50000;

class HalfError extends Error {
  constructor() {
    super('Function produced power for exactly half of maximum');
  }
}

class BingoError extends Error {
  constructor() {
    super('Function produced exactly maximum power');
  }
}

class ZeroError extends Error {
  constructor() {
    super('Function produced 0 power');
  }
}

function randomizeArrayValues(arr = [MAX_POWER, MAX_DURATION]) {
  return arr.map(v => Math.floor(Math.random() * v));
}

/**
 * Returns an async function that returns an integer after some random delay
 *
 * @returns {Function}
 */
function workersGenerator() {
  const [power, duration] = randomizeArrayValues();

  /**
   * Async function that returns an integer after some random delay
   *
   * @returns {Promise.<number>}
   */
  return async () => {
    const [p, d] = randomizeArrayValues([power, duration]);
    if (!p) throw new ZeroError();
    if (p === Math.floor(power / 2))
      return new Promise((resolve, reject) =>
        setTimeout(() => reject(new HalfError()), Math.floor(d / 2)),
      );
    await new Promise(resolve => setTimeout(resolve, d));
    if (p === power) throw new BingoError();
    return p;
  };
}

module.exports = workersGenerator;
module.exports.MAX_DURATION = MAX_DURATION;
module.exports.MAX_POWER = MAX_POWER;
module.exports.HalfError = HalfError;
module.exports.BingoError = BingoError;
module.exports.ZeroError = ZeroError;
