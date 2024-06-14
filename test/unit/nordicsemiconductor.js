/**
 * Copyright reelyActive 2024
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/nordicsemiconductor.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_MOKOSMART_TOF = '076ce40cffffffd204ffff01d318ff';

// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_MOKOSMART_TOF = {
    batteryVoltage: 3.3,
    distance: 1.234,
    uri: "https://sniffypedia.org/Organization/MOKO_Technology_Ltd/"
};



// Describe the scenario
describe('nordicsemiconductor', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with MOKO ToF static data
  it('should handle MOKO ToF data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_MOKOSMART_TOF),
                                          EXPECTED_DATA_MOKOSMART_TOF);
  });

});
