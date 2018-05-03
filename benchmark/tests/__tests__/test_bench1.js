'use strict';

const benchmark = require('../../');
// we need to a mocked random numbers generator
const mockRnd = require('../mock_rand.js');
const workersGenerator = require('../../../');

describe('General purpose benchmark tests', () => {
  test('Test for all workers that works without errors', () => {
    expect.assertions(8);

    jest.useFakeTimers();

    const randVal = 0.1;
    mockRnd.mockReturnValue(randVal);

    const workers = Array(100).fill(workersGenerator());

    const res = benchmark(workers).then(data => {
      expect(data).toBeInstanceOf(Object);
      expect(data.FastestWorker.constructor.name).toBe('AsyncFunction');
      expect(data.FastestValue).toBe(
        workersGenerator.MAX_POWER * randVal * randVal);

      expect(data.MaximumValue).toBe(
        workersGenerator.MAX_POWER * randVal * randVal);
      expect(data.SumValue).toBe(
        workersGenerator.MAX_POWER * randVal * randVal * workers.length);
      expect(data.Total).toBe(workers.length);

      expect(setTimeout).toHaveBeenCalledTimes(workers.length);
      expect(setTimeout).toHaveBeenLastCalledWith(
        expect.any(Function),
        workersGenerator.MAX_DURATION * randVal * randVal);
    });

    jest.runAllTimers();
    return res;
  });

  test('Test for returned average and maximum values', () => {
    expect.assertions(3);

    jest.useFakeTimers();

    const randVal = 0.2;
    mockRnd.mockReturnValue(randVal);

    const workers = Array(100).fill(workersGenerator());

    const minRandVal = 0.1;
    mockRnd.mockReturnValue(minRandVal);
    workers[50] = workersGenerator();

    const maxRandVal = 0.9;
    mockRnd.mockReturnValue(maxRandVal);
    workers[51] = workersGenerator();

    mockRnd.mockReturnValue(randVal);

    const res = benchmark(workers).then(data => {
      expect(data.MaximumValue).toBe(
        workersGenerator.MAX_POWER * randVal * maxRandVal);

      expect(data.SumValue).toBe(
        workersGenerator.MAX_POWER *
          randVal *
          (randVal * (workers.length - 2) + maxRandVal + minRandVal)
      );
      expect(data.Total).toBe(workers.length);
    });

    jest.runAllTimers();
    return res;
  });

  test('Test for exact worker execution order and timeouts', () => {
    expect.assertions(6);

    jest.useFakeTimers();

    const workers = [];

    const rand0Val = 0.1;
    mockRnd.mockReturnValue(rand0Val);
    workers[0] = workersGenerator();

    const rand1Val = 0.2;
    mockRnd.mockReturnValue(rand1Val);
    workers[1] = workersGenerator();

    const rand2Val = 0.3;
    mockRnd.mockReturnValue(rand2Val);
    workers[2] = workersGenerator();

    const rand3Val = 0.4;
    mockRnd.mockReturnValue(rand3Val);
    workers[3] = workersGenerator();

    const randVal = 0.1;
    mockRnd.mockReturnValue(randVal);

    const res = benchmark(workers).then(data => {
      expect(data.Total).toBe(workers.length);
      expect(setTimeout.mock.calls).toHaveLength(workers.length);

      const baseVal = workersGenerator.MAX_DURATION * randVal;
      expect(setTimeout.mock.calls[0][1]).toBe(rand0Val * baseVal);
      expect(setTimeout.mock.calls[1][1]).toBe(rand1Val * baseVal);
      expect(setTimeout.mock.calls[2][1]).toBe(rand2Val * baseVal);
      expect(setTimeout.mock.calls[3][1]).toBe(rand3Val * baseVal);
    });

    jest.runAllTimers();
    return res;
  });

  test('All workers throw a ZeroError', () => {
    expect.assertions(5);

    jest.useFakeTimers();

    const randVal = 0.1;
    mockRnd.mockReturnValue(randVal);

    const workers = Array(100).fill(workersGenerator());

    mockRnd.mockReturnValue(0);

    const res = benchmark(workers).then(data => {
      expect(data.FastestWorker).toBeNull();
      expect(data.MaximumValue).toBe(0);
      expect(data.SumValue).toBe(0);
      expect(data.Total).toBe(0);

      expect(setTimeout).not.toHaveBeenCalled();
    });

    jest.runAllTimers();
    return res;
  });

  test('All workers throw a HalfError', () => {
    expect.assertions(6);

    jest.useFakeTimers();

    const randVal = 0.1;
    mockRnd.mockReturnValue(randVal);

    const workers = Array(100).fill(workersGenerator());

    mockRnd.mockReturnValue(0.5);

    const res = benchmark(workers).then(data => {
      expect(data.FastestWorker).toBeNull();
      expect(data.MaximumValue).toBe(0);
      expect(data.SumValue).toBe(0);
      expect(data.Total).toBe(0);

      expect(setTimeout).toHaveBeenCalledTimes(workers.length);
      expect(setTimeout).toHaveBeenLastCalledWith(
        expect.any(Function),
        workersGenerator.MAX_DURATION * randVal * 0.5 / 2);
    });

    jest.runAllTimers();
    return res;
  });

  test('All workers throw a BingoError', () => {
    expect.assertions(6);

    jest.useFakeTimers();

    const randVal = 0.1;
    mockRnd.mockReturnValue(randVal);

    const workers = Array(100).fill(workersGenerator());

    mockRnd.mockReturnValue(1);

    const res = benchmark(workers).then(data => {
      expect(data.FastestWorker).toBeNull();
      expect(data.MaximumValue).toBe(0);
      expect(data.SumValue).toBe(0);
      expect(data.Total).toBe(0);

      expect(setTimeout).toHaveBeenCalledTimes(workers.length);
      expect(setTimeout).toHaveBeenLastCalledWith(
        expect.any(Function),
        workersGenerator.MAX_DURATION * randVal);
    });

    jest.runAllTimers();
    return res;
  });
});
