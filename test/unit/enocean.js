/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/enocean.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_OCCUPANCY_MULTI_SENSOR =
                                   'a400000041681344c204405709062b2001c724eaf0';


// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_OCCUPANCY_MULTI_SENSOR = {
    txCount: 164,
    temperature: 23.91,
    batteryVoltage: 2.484,
    relativeHumidity: 21.5,
    illuminance: 1218,
    securitySignature: 'c724eaf0'
};


// Describe the scenario
describe('enocean', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with occupancy multi-sensor data
  it('should handle occupancy multi-sensor data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_OCCUPANCY_MULTI_SENSOR),
                     EXPECTED_DATA_OCCUPANCY_MULTI_SENSOR);
  });

});