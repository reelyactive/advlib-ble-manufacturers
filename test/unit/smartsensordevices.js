/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/smartsensordevices.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_HIBOUAIR_PM =
                             '0503471a0c00002627d300b701f1011c001f003300000002';
const INPUT_DATA_HIBOUAIR_CO2 =
                             '05042202f77f022627d300b701f101000000000000023a02';
const INPUT_DATA_HIBOUAIR_CO2_NOISE =
                             '050922028c003be126be00c300d56c00000000000001b002';

// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_HIBOUAIR_PM = {
    boardId: "471a0c",
    illuminance: 0,
    pressure: 100220,
    temperature: 21.1,
    relativeHumidity: 43.9,
    volatileOrganicCompoundsConcentration: 4.97,
    uri: "https://sniffypedia.org/Organization/Smart_Sensor_Devices_AB/"
};
const EXPECTED_DATA_HIBOUAIR_CO2 = {
    boardId: "2202f7",
    illuminance: 639,
    pressure: 100220,
    temperature: 21.1,
    relativeHumidity: 43.9,
    volatileOrganicCompoundsConcentration: 4.97,
    carbonDioxideConcentration: 570,
    uri: "https://sniffypedia.org/Organization/Smart_Sensor_Devices_AB/"
};
const EXPECTED_DATA_HIBOUAIR_CO2_NOISE = {
    boardId: "22028c",
    soundPressure: 61,
    pressure: 99530,
    temperature: 19,
    relativeHumidity: 19.5,
    volatileOrganicCompoundsConcentration: 278.61,
    carbonDioxideConcentration: 432,
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

  // Test the process function with HibouAir CO2 data
  it('should handle decoding HibouAir CO2 Noise data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_HIBOUAIR_CO2_NOISE),
                     EXPECTED_DATA_HIBOUAIR_CO2_NOISE);
  });

});
