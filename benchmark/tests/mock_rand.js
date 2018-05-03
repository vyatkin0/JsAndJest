'use strict';

/**
 * Mocked Math object that replaces random() function by a mocked one
 */
function mockRand() {
  const mockMath = Object.create(global.Math);
  const mockRnd = jest.fn();
  mockMath.random = mockRnd;
  global.Math = mockMath;
  return mockRnd;
}

module.exports = mockRand();
