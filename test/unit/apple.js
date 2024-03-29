/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/apple.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_INVALID_INPUT = 'ff';
const INPUT_DATA_IBEACON = '021500112233445566778899aabbccddeeff01234567fc';


// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_IBEACON = {
    txPower: -4,
    deviceIds: [ "00112233445566778899aabbccddeeff/0123/4567" ],
    uri: "https://sniffypedia.org/Organization/Apple_Inc/iBeacon/"
}


// Describe the scenario
describe('apple', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with invalid data
  it('should handle invalid data as input', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_INVALID_INPUT),
                     EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with valid iBeacon data
  it('should handle valid iBeacon data as input', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_IBEACON),
                     EXPECTED_DATA_IBEACON);
  });

});