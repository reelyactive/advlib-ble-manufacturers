/**
 * Copyright reelyActive 2021
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/minew.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_S4_STATIC = 'a40000090600010100006745233123ac1234';
const INPUT_DATA_S4_DOOR_ALARM = 'a40163010001ff6745233123ac1234';


// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_S4_STATIC = {
    deviceIds: [ 'ac2331234567/2' ],
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/",
    version: "0.9.6"
};
const EXPECTED_DATA_S4_DOOR_ALARM = {
    batteryPercentage: 99,
    deviceIds: [ 'ac2331234567/2' ],
    isContactDetected: [ false ],
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/"
};


// Describe the scenario
describe('minew', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with S4 static data
  it('should handle S4 static data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_S4_STATIC),
                     EXPECTED_DATA_S4_STATIC);
  });

  // Test the process function with S4 door alarm data
  it('should handle S4 door alarm data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_S4_DOOR_ALARM),
                     EXPECTED_DATA_S4_DOOR_ALARM);
  });

});