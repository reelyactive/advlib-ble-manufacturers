/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/efento.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_EXAMPLE = '0205090100002c07803c0001020645c1003d0e8000005d5d';

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

});
