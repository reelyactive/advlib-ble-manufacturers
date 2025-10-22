/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/elainnovation.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_MFR = '06aabbccddeeff'; //0b0942455f544553545f4944';
const INPUT_DATA_TEMP = '12850a'; //0b0950205420383031383033';
const INPUT_DATA_RHT = '213012b80a'; //0d09502052485420393030343539';
const INPUT_DATA_MAG = '320a00'; //0d0950204d414720433030363245';
const INPUT_DATA_MOV = '420c00'; //0d0950204d4f5620423030353537';
const INPUT_DATA_ANG = '56b8ffecffacfc'; //0d0950204d4f5620423030353537';
const INPUT_DATA_DI = '620a00'; //0e0942455f544553545f544f52494e';
const INPUT_DATA_PIR = '929c00'; //1009454c415f5055434b5f5049525f3031';
const INPUT_DATA_TOUCH = 'b29c00'; //1009454c415f5055434b5f5049525f3031';
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
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_MOV = {
    isMotionDetected: [ false ],
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_ANG = {
    acceleration: [ -0.072, -0.02, -0.852 ],
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_DI = {
    isContactDetected: [ false ],
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_PIR = {
    isMotionDetected: [ false ],
    uri: "https://sniffypedia.org/Organization/ELA_Innovation_SA/"
};
const EXPECTED_DATA_TOUCH = {
    isButtonPressed: [ false ],
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
