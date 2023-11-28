/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/mokotechnology.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_P1 = '02150900f15427e0304f16031e0d3a190e0a00000000b0';

// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_P1 = {
    batteryVoltage: 3.594,
    deviceIds: [ '4f30e02754f1/2' ],
    isContactDetected: [ true ],
    isMotionDetected: [ true ],
    uri: "https://sniffypedia.org/Organization/MOKO_Technology_Ltd/"
};



// Describe the scenario
describe('mokotechnology', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with S3 static data
  it('should handle P1 data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_P1), EXPECTED_DATA_P1);
  });

});
