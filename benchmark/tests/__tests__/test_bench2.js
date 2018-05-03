'use strict';

const benchmark = require('../../');
// we need to a mocked random numbers generator
const mockRnd = require('../mock_rand.js');
const workersGenerator = require('../../../');

// predefined random value for normal workers
const randVal = 0.2;

// minimum random value for the fastest worker
// (supposed the timer resolution is 20ms,
// we may require a larger time resolution especially whet the fastest worker is the fist one)
const timerResolution = 20; // ms
const minRandVal =
  randVal - timerResolution / (workersGenerator.MAX_DURATION * randVal);

// we need real timers to obtain a fastest worker
jest.useRealTimers();

describe('Benchmark real time tests for the fastest worker', () => {
  test('Test when the fastest worker is in the middle', () => {
    expect.assertions(2);

    mockRnd.mockReturnValue(randVal);

    const workers = Array(100).fill(workersGenerator());

    mockRnd.mockReturnValue(minRandVal);
    workers[50] = workersGenerator();

    const res = benchmark(workers).then(data => {
      expect(data.FastestWorker).toBe(workers[50]);
      expect(data.Total).toBe(workers.length);
    });

    return res;
  });

  test('Test when the fastest worker is first', () => {
    expect.assertions(2);

    mockRnd.mockReturnValue(randVal);

    const workers = Array(100).fill(workersGenerator());

    mockRnd.mockReturnValue(minRandVal);
    workers[0] = workersGenerator();

    const res = benchmark(workers).then(data => {
      expect(data.FastestWorker).toBe(workers[0]);
      expect(data.Total).toBe(workers.length);
    });

    return res;
  });

  test('Test when the fastest worker is last', () => {
    expect.assertions(2);

    mockRnd.mockReturnValue(randVal);

    const workers = Array(100).fill(workersGenerator());

    mockRnd.mockReturnValue(minRandVal);
    workers[workers.length - 1] = workersGenerator();

    const res = benchmark(workers).then(data => {
      expect(data.FastestWorker).toBe(workers[workers.length - 1]);
      expect(data.Total).toBe(workers.length);
    });

    return res;
  });
});
