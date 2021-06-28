/**
 * Copyright reelyActive 2015-2020
 * We believe in an open Internet of Things
 */


const advlib = require('../../lib/advlibblemanufacturers.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_INVALID_COMPANY_CODE = 0;
const INPUT_DATA_INVALID_HEX_STRING = 'xyz';
const INPUT_DATA_TOO_SHORT_BUFFER = Buffer.from('', 'hex');
const INPUT_DATA_COMPANY_APPLE = 0x004c;
const INPUT_DATA_IBEACON = '0200112233445566778899aabbccddeeff01234567fc';


// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_IBEACON = {
    txPower: -4,
    deviceIds: [ "00112233445566778899aabbccddeeff/0123/4567" ],
    uri: "https://sniffypedia.org/Organization/Apple_Inc/iBeacon/"
}


// Describe the scenario
describe('advlib-ble-manufacturers', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(advlib.processManufacturerSpecificData(),
                     EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with an invalid company code
  it('should handle an invalid company code as input', function() {
    assert.deepEqual(advlib.processManufacturerSpecificData(
                     INPUT_DATA_INVALID_COMPANY_CODE),
                     EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with valid Apple iBeacon data
  it('should handle valid manufacturer-specific data as input', function() {
    assert.deepEqual(advlib.processManufacturerSpecificData(
                     INPUT_DATA_COMPANY_APPLE, INPUT_DATA_IBEACON),
                     EXPECTED_DATA_IBEACON);
  });

});