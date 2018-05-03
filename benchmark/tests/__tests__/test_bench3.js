'use strict';

const benchmark = require('../../');
// we need to a mocked random numbers generator
const mockRnd = require('../mock_rand.js');
const workersGenerator = require('../../../');

// predefined random value for normal workers
const randVal = 0.1;
mockRnd.mockReturnValue(randVal);

const mockResolve = jest.fn();

/**
 * Mocked worker that works with predefined value
 *
 * @returns {Promise.<number>}
 * @param {float} rndRal - predefined random value.
 */
const mockWorker = async rndRal => {
  const [power, duration] = [
    workersGenerator.MAX_POWER,
    workersGenerator.MAX_DURATION];

  const [p, d] = [power, duration].map(v => rndRal * v);

  if (!p) throw new workersGenerator.ZeroError();
  if (p === Math.floor(power / 2))
    return new Promise((resolve, reject) =>
      setTimeout(
        () => reject(new workersGenerator.HalfError()),
        Math.floor(d / 2),
      ),
    );

  await new Promise(resolve => setTimeout(resolve, d));
  if (p === power) throw new workersGenerator.BingoError();

  mockResolve(rndRal);
  return p;
};

// Mocked worker that throws an unknown error after setTimeout
const mockWorkerUnknownDelayedError = async () => {
  await new Promise(resolve => setTimeout(resolve, 1));
  throw 1;
};

// Mocked worker that throws an unknown error immediately
const mockWorkerUnknownError = async () => {
  await 1;
  throw 1;
};

describe('Tests for mocked workers', () => {
  test('One Worker in array throws a ZeroError', () => {
    expect.assertions(6);

    jest.useFakeTimers();

    const workers = Array(100).fill(workersGenerator());

    workers[0] = mockWorker.bind(null, 0);

    const res = benchmark(workers).then(data => {
      expect(data.FastestValue).toBe(
        workersGenerator.MAX_POWER * randVal * randVal);

      expect(data.MaximumValue).toBe(
        workersGenerator.MAX_POWER * randVal * randVal);
      expect(data.SumValue).toBe(
        workersGenerator.MAX_POWER * randVal * randVal * (workers.length - 1));
      expect(data.Total).toBe(workers.length - 1);

      expect(setTimeout).toHaveBeenCalledTimes(workers.length - 1);
      expect(setTimeout).toHaveBeenLastCalledWith(
        expect.any(Function),
        workersGenerator.MAX_DURATION * randVal * randVal);
    });

    jest.runAllTimers();
    return res;
  });

  test('One Worker in array throws a HalfError', () => {
    expect.assertions(7);

    jest.useFakeTimers();

    const workers = Array(100).fill(workersGenerator());

    const halfRandVal = 0.5;
    workers[50] = mockWorker.bind(null, halfRandVal);

    const res = benchmark(workers).then(data => {
      expect(data.FastestValue).toBe(
        workersGenerator.MAX_POWER * randVal * randVal);
      expect(data.MaximumValue).toBe(
        workersGenerator.MAX_POWER * randVal * randVal);
      expect(data.SumValue).toBe(
        workersGenerator.MAX_POWER * randVal * randVal * (workers.length - 1));
      expect(data.Total).toBe(workers.length - 1);

      expect(setTimeout).toHaveBeenCalledTimes(workers.length);

      expect(setTimeout.mock.calls[50][1]).toBe(
        workersGenerator.MAX_DURATION * halfRandVal / 2);

      expect(setTimeout).toHaveBeenLastCalledWith(
        expect.any(Function),
        workersGenerator.MAX_DURATION * randVal * randVal);
    });

    jest.runAllTimers();
    return res;
  });

  test('One Worker in array throws a BingoError', () => {
    expect.assertions(6);

    jest.useFakeTimers();

    const workers = Array(100).fill(workersGenerator());

    workers[99] = mockWorker.bind(null, 1);

    const res = benchmark(workers).then(data => {
      expect(data.FastestValue).toBe(
        workersGenerator.MAX_POWER * randVal * randVal);
      expect(data.MaximumValue).toBe(
        workersGenerator.MAX_POWER * randVal * randVal);
      expect(data.SumValue).toBe(
        workersGenerator.MAX_POWER * randVal * randVal * (workers.length - 1));
      expect(data.Total).toBe(workers.length - 1);

      expect(setTimeout).toHaveBeenCalledTimes(workers.length);
      expect(setTimeout).toHaveBeenLastCalledWith(
        expect.any(Function),
        workersGenerator.MAX_DURATION);
    });

    jest.runAllTimers();
    return res;
  });

  test('One Worker in array throws an unknown error', () => {
    expect.assertions(2);

    jest.useFakeTimers();

    const workers = Array(100).fill(workersGenerator());

    workers[50] = mockWorkerUnknownError;

    const res = benchmark(workers).catch(e => {
      expect(setTimeout).toHaveBeenCalledTimes(workers.length - 1);
      expect(e).toBe(1);
    });

    jest.runAllTimers();
    return res;
  });

  test('One Worker in array throws an unknown delayed error', () => {
    expect.assertions(2);

    jest.useFakeTimers();

    const workers = Array(100).fill(workersGenerator());

    workers[50] = mockWorkerUnknownDelayedError;

    const res = benchmark(workers).catch(e => {
      expect(setTimeout).toHaveBeenCalledTimes(workers.length);
      expect(e).toBe(1);
    });

    jest.runAllTimers();
    return res;
  });
});

describe('Jest Error with mocked timers example', () => {
  const workers = [];

  const randVal0 = 0.1;
  const randVal1 = 0.2;
  const randVal2 = 0.3;
  const randVal3 = 0.4;
  workers[0] = mockWorker.bind(null, randVal3);
  workers[1] = mockWorker.bind(null, randVal2);
  workers[2] = mockWorker.bind(null, randVal1);
  workers[3] = mockWorker.bind(null, randVal0);

  test(
    'All workers executed sequentially with real timers. The test is OK',
    () => {
      expect.assertions(3);

      jest.useRealTimers();

      const res = benchmark(workers).then(data => {
        expect(data).toBeInstanceOf(Object);

        expect(mockResolve).toHaveBeenCalledTimes(workers.length);
        expect(mockResolve.mock.calls).toEqual([
          [randVal0],
          [randVal1],
          [randVal2],
          [randVal3]]);
      });

      return res;
    },
    workersGenerator.MAX_DURATION);

  test('Wrong test with fake timers is successfull!!!. All workers executed sequentially with fake timers.', () => {
    expect.assertions(8);
    mockResolve.mockClear();

    jest.useFakeTimers();

    const res = benchmark(workers).then(data => {
      expect(data).toBeInstanceOf(Object);

      expect(mockResolve).toHaveBeenCalledTimes(workers.length);
      expect(setTimeout).toHaveBeenCalledTimes(workers.length);

      expect(setTimeout.mock.calls[0][1]).toBe(
        randVal3 * workersGenerator.MAX_DURATION);
      expect(setTimeout.mock.calls[1][1]).toBe(
        randVal2 * workersGenerator.MAX_DURATION);
      expect(setTimeout.mock.calls[2][1]).toBe(
        randVal1 * workersGenerator.MAX_DURATION);
      expect(setTimeout.mock.calls[3][1]).toBe(
        randVal0 * workersGenerator.MAX_DURATION);

      // Wrong result. Calls of fn() are in reversed order.
      // That is different from result with real timers.
      expect(mockResolve.mock.calls).toEqual([
        [randVal3],
        [randVal2],
        [randVal1],
        [randVal0]]);
    });

    jest.runAllTimers();
    return res;
  });
});
