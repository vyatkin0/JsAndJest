'use strict';

const NS_PER_SEC = 1e9;
const NS_PER_MSEC = NS_PER_SEC / 1000;

const createHTML = require('create-html');
const fs = require('fs');
const workersGenerator = require('../');

/**
 * Outputs results as HTML formatted file.
 *
 * @param {Object} result - a benchmark execution result object.
 */
function writeResult(result) {
  const html = createHTML({
    title: 'Benchmark result',
    body: `<p>Total workers: ${result.Total}</p>
<p>Fastest Worker: (delay:${Math.floor(result.MinimumDelay / NS_PER_MSEC)}, value:${result.FastestValue}}</p>
<p>Average Delay: ${Math.floor(result.SumDelay / NS_PER_MSEC / result.Total)}</p>
<p>Average Value: ${result.SumValue / result.Total}</p>
<p>Maximum Delay: ${Math.floor(result.MaximumDelay / NS_PER_MSEC)}</p>
<p>Maximum Value: ${result.MaximumValue}</p>`,
  });

  fs.writeFile('result.html', html, err => {
    if (err) console.log(err);
  });
}

/**
 * Starts a benchmark for supplied workers.
 * Workers that throw errors are ignored.
 *
 * @param {[AsyncFunction]} workers - array of workers async functions.
 * @returns {Promise.<Object>}
 */
function startBenchmark(workers) {
  const result = {};

  result.FastestWorker = null;
  result.FastestValue = null;
  result.MinimumDelay = workersGenerator.MAX_DURATION * NS_PER_MSEC;

  result.SumDelay = 0;
  result.SumValue = 0;
  result.MaximumDelay = 0;
  result.MaximumValue = 0;
  result.Total = workers.length;

  return Promise.all(
    workers.map(async worker => {
      try {
        const t0 = process.hrtime();
        const value = await worker();
        const diff = process.hrtime(t0);
        const delay = diff[0] * NS_PER_SEC + diff[1];
        result.SumDelay += delay;
        result.SumValue += value;
        if (result.MaximumValue < value) result.MaximumValue = value;
        if (result.MaximumDelay < delay) result.MaximumDelay = delay;
        if (result.MinimumDelay > delay) {
          result.MinimumDelay = delay;
          result.FastestWorker = worker;
          result.FastestValue = value;
        }
      } catch (err) {
        --result.Total;
        if (err instanceof workersGenerator.HalfError) {
        } else if (err instanceof workersGenerator.BingoError) {
        } else if (err instanceof workersGenerator.ZeroError) {
        } else throw err;
      }
    })
  ).then(() => result);
}

const workers = Array(100).fill(workersGenerator());

startBenchmark(workers).then(data => writeResult(data));

module.exports = startBenchmark;
