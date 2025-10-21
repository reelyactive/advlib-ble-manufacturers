/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/ruuvi.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_RAW_V2 = '0512fc5394c37c0004fffc040cac364200Cdcbb8334c884f';
const INPUT_DATA_AIR = '06170c5668c79e007000c90501d900cd004c884f';

// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_RAW_V2 = {
    temperature: 24.3,
    relativeHumidity: 53.49,
    pressure: 100044,
    acceleration: [ 0.004, -0.004, 1.036 ],
    batteryVoltage: 2.977,
    txPower: 4,
    txCount: 205,
    deviceIds: [ "cbb8334c884f" ],
    uri: "https://sniffypedia.org/Product/Ruuvi_RuuviTag/"
};
const EXPECTED_DATA_AIR = {
    temperature: 29.5,
    relativeHumidity: 55.3,
    pressure: 101102,
    "pm2.5": 11.2,
    carbonDioxideConcentration: 201,
    volatileOrganicCompoundsConcentration: 0.00964948117366974,
    nitrogenOxideIndex: 2,
    illuminance: 13026.67,
    txCount: 205,
    uri: "https://sniffypedia.org/Product/Ruuvi_Air/"
};


// Describe the scenario
describe('ruuvi', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with the RAWv2 example data
  it('should handle decoding RAWv2 data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_RAW_V2),
                     EXPECTED_DATA_RAW_V2);
  });

  // Test the process function with the Air example data
  it('should handle decoding Air data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_AIR), EXPECTED_DATA_AIR);
  });

});
