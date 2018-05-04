# js-and-jest

Basic test for ES2017 and Jest knowledge

## Definition

The default export of this repository module (`index.js`) returns a function `workersGenerator` that generates an async worker function that returns an integer after some random delay.

1. `workersGenerator` sets maximum delay for each generated worker function to random value `0..MAX_DURATION`
2. `workersGenerator` sets maximum of return value to a random value `0..MAX_POWER`
3. Resulted worker function returns an integer value up to maximum value generated in [2] after delay up to time in ms generated in [1]
4. Worker function will throw `ZeroError` immediately if resulted random value is equal to 0.
5. Worker function will throw `HalfError` after half of delay generated in [3] if resulted value is half of maximum generated in [3].
6. Worker function will throw `BingoError` if resulted value is exactly maximum value generated in [3]

## Exercise

Please implement following:

* [ ] Implement benchmarks that out of 100 generated workers will find following statistics:
  1. Fastest worker
  2. Average workers delay
  3. Average workers result value
  4. Maximum workers delay
  5. Maximum workers result value
* [ ] Your benchmark must output results as HTML formatted file.
* [ ] Your benchmark must have 100% code coverage using Jest.
