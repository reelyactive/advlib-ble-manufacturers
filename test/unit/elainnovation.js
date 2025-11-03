/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/elainnovation.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_MFR = '06aabbccddeeff';
const INPUT_DATA_TEMP = '12850a';
const INPUT_DATA_RHT = '213012b80a';
const INPUT_DATA_MAG = '320a00';
const INPUT_DATA_MOV = '420c00';
const INPUT_DATA_ANG = '56b8ffecffacfc';
const INPUT_DATA_DI = '620a00';
const INPUT_DATA_PIR = '929c00';
const INPUT_DATA_TOUCH = 'b29c00';
const INPUT_DATA_BATT_PERCENT = 'f145';
const INPUT_DATA_BATT_VOLTAGE = 'f2ac0b';


// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_MFR = {
    deviceIds: [ 'aabbccddeeff' ],
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_TEMP = {
    temperature: 26.93,
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_RHT = {
    relativeHumidity: 48,
    temperature: 27.44,
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_MAG = {
    isContactDetected: [ false ],
    isContactDetectedCycle: 5,
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_MOV = {
    isMotionDetected: [ false ],
    isMotionDetectedCycle: 6,
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_ANG = {
    acceleration: [ -0.072, -0.02, -0.852 ],
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_DI = {
    isInputDetected: [ false ],
    isInputDetectedCycle: 5,
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_PIR = {
    isMotionDetected: [ false ],
    isMotionDetectedCycle: 78,
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_TOUCH = {
    isButtonPressed: [ false ],
    isButtonPressedCycle: 78,
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_BATT_PERCENT = {
    batteryPercentage: 69,
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_BATT_VOLTAGE = {
    batteryVoltage: 2.988,
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};


// Describe the scenario
describe('elainnovation', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with the ID/ID+ example data
  it('should handle decoding ID/ID+ data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_MFR), EXPECTED_DATA_MFR);
  });

  // Test the process function with the T, T EN, T Probe example data
  it('should handle decoding T, T EN, T Probe data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_TEMP), EXPECTED_DATA_TEMP);
  });

  // Test the process function with the RHT example data
  it('should handle decoding RHT data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_RHT), EXPECTED_DATA_RHT);
  });

  // Test the process function with the MAG example data
  it('should handle decoding MAG data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_MAG), EXPECTED_DATA_MAG);
  });

  // Test the process function with the MOV example data
  it('should handle decoding MOV data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_MOV), EXPECTED_DATA_MOV);
  });

  // Test the process function with the ANG example data
  it('should handle decoding ANG data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_ANG), EXPECTED_DATA_ANG);
  });

  // Test the process function with the DI example data
  it('should handle decoding DI data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_DI), EXPECTED_DATA_DI);
  });

  // Test the process function with the PIR example data
  it('should handle decoding PIR data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_PIR), EXPECTED_DATA_PIR);
  });

  // Test the process function with the TOUCH example data
  it('should handle decoding TOUCH data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_TOUCH),
                     EXPECTED_DATA_TOUCH);
  });

  // Test the process function with the BATT example data
  it('should handle decoding BATT (%) data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_BATT_PERCENT),
                     EXPECTED_DATA_BATT_PERCENT);
  });

  // Test the process function with the BATT example data
  it('should handle decoding BATT (V) data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_BATT_VOLTAGE),
                     EXPECTED_DATA_BATT_VOLTAGE);
  });

});
