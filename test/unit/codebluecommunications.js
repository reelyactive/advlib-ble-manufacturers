/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/codebluecommunications.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_INVALID_INPUT = 'ff';
const INPUT_DATA_DIRACT_PROXIMITY = '01ec12345678f3d3ffaabbccdd17';
const INPUT_DATA_DIRACT_DIGEST = '110b12345678800045aabbccdd0c';


// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_DIRACT_PROXIMITY = {
    acceleration: [ -0.25, -0.1875, 0.9375 ],
    batteryPercentage: 100,
    deviceIds: [ '12345678' ],
    nearest: [ { deviceId: "aabbccdd", rssi: -69 } ]
}
const EXPECTED_DATA_DIRACT_DIGEST = {
    deviceIds: [ '12345678' ],
    nearest: [ { deviceId: "aabbccdd", interactionCount: 12 } ],
    timestamp: 69
}


// Describe the scenario
describe('codebluecommunications', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with invalid data
  it('should handle invalid data as input', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_INVALID_INPUT),
                     EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with valid DirAct proximity data
  it('should handle valid DirAct proximity data as input', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_DIRACT_PROXIMITY),
                     EXPECTED_DATA_DIRACT_PROXIMITY);
  });

  // Test the process function with valid DirAct digest data
  it('should handle valid DirAct digest data as input', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_DIRACT_DIGEST),
                     EXPECTED_DATA_DIRACT_DIGEST);
  });

});