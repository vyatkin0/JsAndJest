'use strict';

const workersGenerator = require('../');

describe('Async random workers generating function', () => {
  test('creates functions', () => {
    const res = workersGenerator();
    expect(res).toBeInstanceOf(Function);
  });
  test('workers are async functions', () => {
    // we will prevent function from actually running the timeout
    jest.useFakeTimers();
    const worker = workersGenerator();
    const res = worker();
    expect(res.constructor.name).toBe('Promise');
  });
});
