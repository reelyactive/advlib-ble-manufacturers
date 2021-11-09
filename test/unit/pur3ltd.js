/**
 * Copyright reelyActive 2021
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/pur3ltd.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_VALID_JSON = '7b226e616d65223a224573707275696e6f227d';
const INPUT_DATA_EMPTY_JSON = '7b7d';
const INPUT_DATA_INVALID_JSON = '12345678';


// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_VALID_JSON = {
    name: "Espruino",
    uri: "https://sniffypedia.org/Organization/Pur3_Ltd/"
};
const EXPECTED_DATA_EMPTY_JSON = {
    uri: "https://sniffypedia.org/Organization/Pur3_Ltd/"
};
const EXPECTED_DATA_INVALID_JSON = {
    uri: "https://sniffypedia.org/Organization/Pur3_Ltd/"
};


// Describe the scenario
describe('pur3ltd', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with valid JSON data
  it('should handle valid JSON data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_VALID_JSON),
                     EXPECTED_DATA_VALID_JSON);
  });

  // Test the process function with empty JSON data
  it('should handle empty JSON data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_EMPTY_JSON),
                     EXPECTED_DATA_EMPTY_JSON);
  });

  // Test the process function with invalid JSON data
  it('should handle invalid JSON data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_INVALID_JSON),
                     EXPECTED_DATA_INVALID_JSON);
  });

});