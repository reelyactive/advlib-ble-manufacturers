/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/smartsensordevices.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_HIBOUAIR_PM =
                             '0503471a0c7f022627d300b701f1011c001f003300023a02';
const INPUT_DATA_HIBOUAIR_CO2 =
                             '0504471a0c7f022627d300b701f101000000000000023a02';

// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_HIBOUAIR_PM = {
    boardId: 4659724,
    illuminance: 639,
    pressure: 100220000,
    temperature: 21.1,
    relativeHumidity: 43.9,
    uri: "https://sniffypedia.org/Organization/Smart_Sensor_Devices_AB/"
};
const EXPECTED_DATA_HIBOUAIR_CO2 = {
    boardId: 4659724,
    illuminance: 639,
    pressure: 100220000,
    temperature: 21.1,
    relativeHumidity: 43.9,
    carbonDioxideConcentration: 570,
    uri: "https://sniffypedia.org/Organization/Smart_Sensor_Devices_AB/"
};


// Describe the scenario
describe('smartsensordevices', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with the HibouAir PM example data
  it('should handle decoding HibouAir PM data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_HIBOUAIR_PM),
                     EXPECTED_DATA_HIBOUAIR_PM);
  });

  // Test the process function with HibouAir CO2 data
  it('should handle decoding HibouAir CO2 data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_HIBOUAIR_CO2),
                     EXPECTED_DATA_HIBOUAIR_CO2);
  });

});
