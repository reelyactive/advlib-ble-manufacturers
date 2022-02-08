/**
 * Copyright reelyActive 2015-2022
 * We believe in an open Internet of Things
 */


const manufacturer = require('../../lib/enocean.js');
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_OCCUPANCY_MULTI_SENSOR =
                                   'a400000041681344c204405709062b2001c724eaf0';
const INPUT_DATA_IOT_MULTI_SENSOR =
                           '45000000408a07063b450b008a000228a6230102af0bfd5f17';
const INPUT_DATA_MOTION_DETECTOR = 'a000000002c044090045010020021012b343';
const INPUT_DATA_PTM_215B_PRESS = '5f0000000909df40a3';
const INPUT_DATA_PTM_215B_RELEASE = '60000000084cc8f7a5';


// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;
const EXPECTED_DATA_OCCUPANCY_MULTI_SENSOR = {
    txCount: 164,
    temperature: 23.91,
    batteryVoltage: 2.484,
    relativeHumidity: 21.5,
    illuminance: 1218,
    isMotionDetected: [ false ],
    securitySignature: "c724eaf0",
    uri: "https://sniffypedia.org/Organization/EnOcean_GmbH/"
};
const EXPECTED_DATA_IOT_MULTI_SENSOR = {
    txCount: 69,
    acceleration: [ 0, 0, 0.98 ],
    temperature: 19.3,
    batteryPercentage: 87.5,
    relativeHumidity: 29.5,
    illuminance: 11,
    isMotionDetected: [ true ],
    isContactDetected: [ false ],
    securitySignature: "0bfd5f17",
    uri: "https://sniffypedia.org/Organization/EnOcean_GmbH/"
};
const EXPECTED_DATA_MOTION_DETECTOR = {
    txCount: 160,
    batteryPercentage: 96,
    illuminance: 1,
    isMotionDetected: [ true ],
    securitySignature: "1012b343",
    uri: "https://sniffypedia.org/Organization/EnOcean_GmbH/"
};
const EXPECTED_DATA_PTM_215B_PRESS = {
    txCount: 95,
    isButtonPressed: [ false, false, true, false ],
    securitySignature: "09df40a3",
    uri: "https://sniffypedia.org/Organization/EnOcean_GmbH/"
}
const EXPECTED_DATA_PTM_215B_RELEASE = {
    txCount: 96,
    isButtonPressed: [ false, false, false, false ],
    securitySignature: "4cc8f7a5",
    uri: "https://sniffypedia.org/Organization/EnOcean_GmbH/"
}


// Describe the scenario
describe('enocean', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(manufacturer.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with occupancy multi-sensor data
  it('should handle occupancy multi-sensor data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_OCCUPANCY_MULTI_SENSOR),
                     EXPECTED_DATA_OCCUPANCY_MULTI_SENSOR);
  });

  // Test the process function with IoT multi-sensor data
  it('should handle IoT multi-sensor data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_IOT_MULTI_SENSOR),
                     EXPECTED_DATA_IOT_MULTI_SENSOR);
  });

  // Test the process function with motion detector data
  it('should handle motion detector data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_MOTION_DETECTOR),
                     EXPECTED_DATA_MOTION_DETECTOR);
  });

  // Test the process function with PTM_215B button press data
  it('should handle rocker pad press data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_PTM_215B_PRESS),
                     EXPECTED_DATA_PTM_215B_PRESS);
  });

  // Test the process function with PTM_215B button release data
  it('should handle rocker pad release data', function() {
    assert.deepEqual(manufacturer.process(INPUT_DATA_PTM_215B_RELEASE),
                     EXPECTED_DATA_PTM_215B_RELEASE);
  });

});