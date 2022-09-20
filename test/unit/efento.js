/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/efento.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_EXAMPLE = '0205090100002c07803c0001020645c1003d0e8000005d5d';
const INPUT_DATA_DECODING_ADVERTISING_FRAME =
                             '031122334455660000010000000000000000000000005d5d';
const INPUT_DATA_DECODING_SCAN_RESPONSE_FRAME = '040145c102003d0327955d5d';

// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_EXAMPLE = {
    measurementPeriodSeconds: 60,
    relativeHumidity: 61,
    temperature: 28.569999999999993,
    txCount: 11271,
    uri: "https://sniffypedia.org/Organization/Efento_Sp_zoo/",
    version: "5.9"
};
const EXPECTED_DATA_DECODING_ADVERTISING_FRAME = {
    deviceIds: [ "112233445566/2" ],
    uri: "https://sniffypedia.org/Organization/Efento_Sp_zoo/"
};
const EXPECTED_DATA_DECODING_SCAN_RESPONSE_FRAME = {
    pressure: 101330,
    relativeHumidity: 61,
    temperature: 28.569999999999993,
    uri: "https://sniffypedia.org/Organization/Efento_Sp_zoo/"
};


// Describe the scenario
describe('efento', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with the published example data
  it('should handle the published example data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_EXAMPLE),
                     EXPECTED_DATA_EXAMPLE);
  });

  // Test the process function with decoding advertising frame data
  it('should handle decoding advertising frame data', function() {
    assert.deepEqual(manufacturer.process(
                                         INPUT_DATA_DECODING_ADVERTISING_FRAME),
                     EXPECTED_DATA_DECODING_ADVERTISING_FRAME);
  });

  // Test the process function with decoding scan response frame data
  it('should handle decoding scan response frame data', function() {
    assert.deepEqual(manufacturer.process(
                                       INPUT_DATA_DECODING_SCAN_RESPONSE_FRAME),
                     EXPECTED_DATA_DECODING_SCAN_RESPONSE_FRAME);
  });

});
