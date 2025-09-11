/**
 * Copyright reelyActive 2021-2025
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/minew.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_MSE01 = '51012345220100efb598c3b498c0b63cbed37ebd0398bd';
const INPUT_DATA_MSE02 = '5102466441ff0fef0398c6b63cc2b498c177bec0cb98bd';
const INPUT_DATA_S3_STATIC = 'a301010017000b00010100006745233123ac23d3';
const INPUT_DATA_S3_TEMPERATURE_HUMIDITY = 'a30364197348466745233123ac007ad3';
const INPUT_DATA_S4_STATIC = 'a40000090600010100006745233123ac1234';
const INPUT_DATA_S4_DOOR_ALARM = 'a40163010001ff6745233123ac1234';
const INPUT_DATA_V3_TYPE_00 = 
                             'ca006745233123ac6421870000000000000000001234abcd';
const INPUT_DATA_V3_TYPE_03 = 'ca030300050005ff0421643a7ac951';
const INPUT_DATA_V3_TYPE_05_00 =
                             'ca05000000197348466d696e65770000000000001234abcd';
const INPUT_DATA_V3_TYPE_05_01 =
                             'ca05010200197348466d696e65770000000100001234abcd';
const INPUT_DATA_V3_TYPE_18_00 =
                             'ca18007f230110320000000000000000000000001234abcd';
const INPUT_DATA_V3_TYPE_18_01 =
                             'ca180106046e849b8c709a8c86987a7a8e0000001234abcd';
const INPUT_DATA_V3_TYPE_1B =
                             'ca1b010007000165332211ac05ef197300c5000000000010';
const INPUT_DATA_V3_TYPE_1E =
                             'ca1e0064f4010f450700000000000000000000001234abcd';


// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_MSE01 = {
    batteryPercentage: 69,
    isButtonPressed: [ true, false ],
    isContactDetected: [ true ],
    isMotionDetected: [ true ],
    levelPercentage: 0.02442002442002442,
    txCount: 35,
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/"
};
const EXPECTED_DATA_MSE02 = {
    batteryPercentage: 100,
    isButtonPressed: [ false, true ],
    isContactDetected: [ false ],
    isMotionDetected: [ false ],
    levelPercentage: 100,
    txCount: 70,
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/"
};
const EXPECTED_DATA_S3_STATIC = {
    deviceIds: [ 'ac2331234567/2' ],
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/",
    version: "1.0.23"
};
const EXPECTED_DATA_S3_TEMPERATURE_HUMIDITY = {
    batteryPercentage: 100,
    deviceIds: [ 'ac2331234567/2' ],
    temperature: 25.44921875,
    relativeHumidity: 72.2734375,
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
const EXPECTED_DATA_V3_TYPE_00 = {
    batteryPercentage: 100,
    deviceIds: [ 'ac2331234567/2' ],
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/",
    version: "1.3.7"
};
const EXPECTED_DATA_V3_TYPE_03 = {
    acceleration: [ 0.01953125, 0.01953125, -0.984375 ],
    batteryPercentage: 100,
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/"
};
const EXPECTED_DATA_V3_TYPE_05_00 = {
    name: "minew",
    temperature: 25.44921875,
    relativeHumidity: 72.2734375,
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/"
};
const EXPECTED_DATA_V3_TYPE_05_01 = {
    isMarked: [ true ],
    name: "minew",
    temperature: 25.44921875,
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/"
};
const EXPECTED_DATA_V3_TYPE_18_00 = {
    passageCounts: [ 0x0123, 0x3210 ],
    passageCountsCycle: 127,
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/"
};
const EXPECTED_DATA_V3_TYPE_18_01 = {
    numberOfOccupants: 4,
    numberOfOccupantsCycle: 6,
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/"
};
const EXPECTED_DATA_V3_TYPE_1B = {
    temperature: 25.44921875,
    batteryVoltage: 1.519,
    txPower: -59,
    deviceIds: [ 'ac1122336501/2' ],
    uri: "https://sniffypedia.org/Product/Minew_MTB02/"
};
const EXPECTED_DATA_V3_TYPE_1E = {
    distance: 0.5,
    distanceCycle: 100,
    isBatteryLow: true,
    isContactDetected: [ false ],
    isMotionDetected: [ true ],
    isOccupancyDetected: [ true ],
    occupancyDetectionCycle: 69,
    tamperCycle: 7,
    uri: "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/"
};


// Describe the scenario
describe('minew', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with MSE01 data
  it('should handle MSE01 data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_MSE01),
                     EXPECTED_DATA_MSE01);
  });

  // Test the process function with MSE02 data
  it('should handle MSE02 data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_MSE02),
                     EXPECTED_DATA_MSE02);
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

  // Test the process function with V3 type 0x00 data
  it('should handle V3 type 0x00 (device information) data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_V3_TYPE_00),
                     EXPECTED_DATA_V3_TYPE_00);
  });

  // Test the process function with V3 type 0x03 data
  it('should handle V3 type 0x03 (combination) data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_V3_TYPE_03),
                     EXPECTED_DATA_V3_TYPE_03);
  });

  // Test the process function with V3 type 0x05 data (00)
  it('should handle V3 type 0x05 (temperature & humidity) data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_V3_TYPE_05_00),
                     EXPECTED_DATA_V3_TYPE_05_00);
  });

  // Test the process function with V3 type 0x05 data (00)
  it('should handle V3 type 0x05 (temperature & humidity) data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_V3_TYPE_05_01),
                     EXPECTED_DATA_V3_TYPE_05_01);
  });

  // Test the process function with V3 type 0x18 data (00)
  it('should handle V3 type 0x18 (radar) data (ped. traffic)', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_V3_TYPE_18_00),
                     EXPECTED_DATA_V3_TYPE_18_00);
  });

  // Test the process function with V3 type 0x18 data (01)
  it('should handle V3 type 0x18 (radar) data (occupant info)', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_V3_TYPE_18_01),
                     EXPECTED_DATA_V3_TYPE_18_01);
  });

  // Test the process function with V3 type 0x1b data
  it('should handle V3 type 0x1b (temperature) data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_V3_TYPE_1B),
                     EXPECTED_DATA_V3_TYPE_1B);
  });

  // Test the process function with V3 type 0x1e data
  it('should handle V3 type 0x1e (time-of-flight) data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_V3_TYPE_1E),
                     EXPECTED_DATA_V3_TYPE_1E);
  });

});
