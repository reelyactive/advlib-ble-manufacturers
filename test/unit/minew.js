/**
 * Copyright reelyActive 2021-2022
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/minew.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_S3_STATIC = 'a301010017000b00010100006745233123ac23d3';
const INPUT_DATA_S3_TEMPERATURE_HUMIDITY = 'a30364197348466745233123ac007ad3';
const INPUT_DATA_S4_STATIC = 'a40000090600010100006745233123ac1234';
const INPUT_DATA_S4_DOOR_ALARM = 'a40163010001ff6745233123ac1234';
const INPUT_DATA_V3_STATIC = 'ca006745233123ac6421870000000000000000001234abcd';
const INPUT_DATA_V3_TEMPERATURE_HUMIDITY =
                                 'ca05000000197348466d696e65770000000000000000';


// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_S3_STATIC = {
    deviceIds: [ 'ac2331234567/2' ],
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/",
    version: "1.0.23"
};
const EXPECTED_DATA_S3_TEMPERATURE_HUMIDITY = {
    batteryPercentage: 100,
    deviceIds: [ 'ac2331234567/2' ],
    temperature: 25.44921875,
    humidity: 72.2734375,
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/"
};
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
const EXPECTED_DATA_V3_STATIC = {
    batteryPercentage: 100,
    deviceIds: [ 'ac2331234567/2' ],
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/",
    version: "1.3.7"
};
const EXPECTED_DATA_V3_TEMPERATURE_HUMIDITY = {
    temperature: 25.44921875,
    humidity: 72.2734375,
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/"
};


// Describe the scenario
describe('minew', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with S3 static data
  it('should handle S3 static data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_S3_STATIC),
                     EXPECTED_DATA_S3_STATIC);
  });

  // Test the process function with S3 temperature humidity data
  it('should handle S3 temperature humidity data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_S3_TEMPERATURE_HUMIDITY),
                     EXPECTED_DATA_S3_TEMPERATURE_HUMIDITY);
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

  // Test the process function with V3 static data
  it('should handle V3 static data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_V3_STATIC),
                     EXPECTED_DATA_V3_STATIC);
  });

  // Test the process function with V3 temperature humidity data
  it('should handle V3 temperature humidity data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_V3_TEMPERATURE_HUMIDITY),
                     EXPECTED_DATA_V3_TEMPERATURE_HUMIDITY);
  });

});
