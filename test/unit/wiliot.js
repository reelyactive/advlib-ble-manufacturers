/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/wiliot.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_VALID_PAYLOAD =
                      '010000930c9f0ca420b52c49cf75e6fcc543db7c87e754c65af075';
const INPUT_DATA_INVALID_PAYLOAD = '';


// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_PAYLOAD = null;
const EXPECTED_DATA_VALID_PAYLOAD = {
    relay: {
        type: "wiliot",
        payload: "0005010000930c9f0ca420b52c49cf75e6fcc543db7c87e754c65af075"
    },
    uri: "https://sniffypedia.org/Organization/Wiliot_Ltd/"
};


// Describe the scenario
describe('wiliot', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_PAYLOAD);
  });

  // Test the process function with valid payload data
  it('should handle valid payload data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_VALID_PAYLOAD),
                     EXPECTED_DATA_VALID_PAYLOAD);
  });

  // Test the process function with invalid JSON data
  it('should handle invalid payload data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_INVALID_PAYLOAD),
                     EXPECTED_DATA_INVALID_PAYLOAD);
  });

});
