/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/lairdconnectivity.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_BATTERY_VOLTAGE = '0100000000006655443322110c01001e621562050d000000';
const INPUT_DATA_TEMPERATURE_3 = '0100000000006655443322111401001e6215620000a84100';

// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_BATTERY_VOLTAGE = {
    batteryVoltage: 3.333,
    deviceIds: [ "112233445566/3" ],
    flags: 0,
    networkId: 0,
    recordNumber: 1,
    timestamp: 1645568542,
    uri: "https://sniffypedia.org/Organization/Laird_Connectivity/"
};
const EXPECTED_DATA_TEMPERATURE_3 = {
    deviceIds: [ "112233445566/3" ],
    flags: 0,
    networkId: 0,
    recordNumber: 1,
    temperature: 21.0,
    timestamp: 1645568542,
    uri: "https://sniffypedia.org/Organization/Laird_Connectivity/"
};


// Describe the scenario
describe('lairdconnectivity', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with battery voltage data
  it('should handle battery voltage data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_BATTERY_VOLTAGE),
                     EXPECTED_DATA_BATTERY_VOLTAGE);
  });

  // Test the process function with temperature data
  it('should handle temperature data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_TEMPERATURE_3),
                     EXPECTED_DATA_TEMPERATURE_3);
  });

});
