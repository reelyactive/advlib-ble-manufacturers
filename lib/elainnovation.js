/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 1;
const TYPE_MFR_ID = 0x06;
const TYPE_NAME_ID = 0x09;
const TYPE_TEMP_ID = 0x12;
const TYPE_RHT_ID = 0x21;
const TYPE_MAG_ID = 0x32;
const TYPE_MOV_ID = 0x42;
const TYPE_ANG_ID = 0x56;
const TYPE_DI_ID = 0x62;
const TYPE_PIR_ID = 0x92;
const TYPE_TOUCH_ID = 0xb2;
const TYPE_BATT_PERCENT_ID = 0xf1;
const TYPE_BATT_VOLTAGE_ID = 0xf2;
const MFR_FRAME_LENGTH_BYTES = 7;
const TEMP_FRAME_LENGTH_BYTES = 3;
const RHT_FRAME_LENGTH_BYTES = 5;
const RHT_FRAME_TEMP_TYPE_OFFSET = 2;
const RHT_FRAME_TEMP_OFFSET = 3;
const MAG_FRAME_LENGTH_BYTES = 3;
const MOV_FRAME_LENGTH_BYTES = 3;
const ANG_FRAME_LENGTH_BYTES = 7;
const ANG_FRAME_Y_OFFSET = 3;
const ANG_FRAME_Z_OFFSET = 5;
const DI_FRAME_LENGTH_BYTES = 3;
const PIR_FRAME_LENGTH_BYTES = 3;
const TOUCH_FRAME_LENGTH_BYTES = 3;
const BATT_PERCENT_FRAME_LENGTH_BYTES = 2;
const BATT_VOLTAGE_FRAME_LENGTH_BYTES = 3;
const FRAME_DATA_OFFSET = 1;
const MFR_NUM_LENGTH_BYTES = 6;
const ELA_INNOVATION_URI =
                     "https://sniffypedia.org/Organization/ELA_Innovation_SA/";


/**
 * Process ELA Innovation manufacturer-specific data.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed ELA Innovation data as JSON.
 */
function process(data) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_DATA_LENGTH_BYTES)) {
    return null;
  }

  let frameId = buf.readUInt8();

  switch(frameId) {
    case TYPE_MFR_ID:          // ID, ID+
      return processManufacturerFrame(buf);
    case TYPE_TEMP_ID:         // T, T EN, T Probe
      return processTemperatureFrame(buf);
    case TYPE_RHT_ID:          // RHT
      return processTemperatureHumidityFrame(buf);
    case TYPE_MAG_ID:          // MAG
      return processMagneticContactFrame(buf);
    case TYPE_MOV_ID:          // MOV
      return processMovementDetectionFrame(buf);
    case TYPE_ANG_ID:          // ANG
      return processAccelerationFrame(buf);
    case TYPE_DI_ID:           // DI
      return processDigitalInputFrame(buf);
    case TYPE_PIR_ID:          // PIR
      return processPassiveInfraredFrame(buf);
    case TYPE_TOUCH_ID:        // TOUCH
      return processTouchFrame(buf);
    case TYPE_BATT_PERCENT_ID: // BATT (%)
      return processBatteryPercentFrame(buf);
    case TYPE_BATT_VOLTAGE_ID: // BATT (V)
      return processBatteryVoltageFrame(buf);
    default:
      return { uri: ELA_INNOVATION_URI };
  }
}


/**
 * Process manufacturer frame containing ID/ID+ data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed ID/ID+ data as JSON.
 */
function processManufacturerFrame(data) {
  if(data.length !== MFR_FRAME_LENGTH_BYTES) {
    return null;
  }

  let deviceId = data.toString('hex', FRAME_DATA_OFFSET,
                               FRAME_DATA_OFFSET + MFR_NUM_LENGTH_BYTES);

  return { deviceIds: [ deviceId ], uri: ELA_INNOVATION_URI }
}


/**
 * Process temperature frame containing T data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed T data as JSON.
 */
function processTemperatureFrame(data) {
  if(data.length !== TEMP_FRAME_LENGTH_BYTES) {
    return null;
  }

  let temperature = data.readInt16LE(FRAME_DATA_OFFSET) / 100;

  return { temperature: temperature, uri: ELA_INNOVATION_URI }
}


/**
 * Process temperature/humidity frame containing RHT data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed RHT data as JSON.
 */
function processTemperatureHumidityFrame(data) {
  if(data.length !== RHT_FRAME_LENGTH_BYTES) {
    return null;
  }

  let elaSensor = { relativeHumidity: data.readUInt8(FRAME_DATA_OFFSET),
                    uri: ELA_INNOVATION_URI };
  let isTemperature = (data.readUInt8(RHT_FRAME_TEMP_TYPE_OFFSET) ===
                       TYPE_TEMP_ID);

  if(isTemperature) {
    elaSensor.temperature = data.readInt16LE(RHT_FRAME_TEMP_OFFSET) / 100;
  }

  return elaSensor;
}


/**
 * Process magnetic contact frame containing MAG data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed MAG data as JSON.
 */
function processMagneticContactFrame(data) {
  if(data.length !== MAG_FRAME_LENGTH_BYTES) {
    return null;
  }

  let countAndState = data.readUInt16LE(FRAME_DATA_OFFSET);
  let eventCount = countAndState / 2;
  let isContactDetected = ((countAndState % 2) === 1); // Odd = contact

  return {
      isContactDetected: [ isContactDetected ],
      uri: ELA_INNOVATION_URI
  }
}


/**
 * Process movement detection frame containing MOV data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed MOV data as JSON.
 */
function processMovementDetectionFrame(data) {
  if(data.length !== MOV_FRAME_LENGTH_BYTES) {
    return null;
  }

  let countAndState = data.readUInt16LE(FRAME_DATA_OFFSET);
  let eventCount = countAndState / 2;
  let isMotionDetected = ((countAndState % 2) === 1); // Odd = motion

  return {
      isMotionDetected: [ isMotionDetected ],
      uri: ELA_INNOVATION_URI
  }
}


/**
 * Process acceleration frame containing ANG data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed ANG data as JSON.
 */
function processAccelerationFrame(data) {
  if(data.length !== ANG_FRAME_LENGTH_BYTES) {
    return null;
  }

  let accelerationX = data.readInt16LE(FRAME_DATA_OFFSET) / 1000;
  let accelerationY = data.readInt16LE(ANG_FRAME_Y_OFFSET) / 1000;
  let accelerationZ = data.readInt16LE(ANG_FRAME_Z_OFFSET) / 1000;

  return {
      acceleration: [ accelerationX, accelerationY, accelerationZ ],
      uri: ELA_INNOVATION_URI
  }
}


/**
 * Process digital input frame containing DI data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed DI data as JSON.
 */
function processDigitalInputFrame(data) {
  if(data.length !== DI_FRAME_LENGTH_BYTES) {
    return null;
  }

  let countAndState = data.readUInt16LE(FRAME_DATA_OFFSET);
  let eventCount = countAndState / 2;
  let isContactDetected = ((countAndState % 2) === 1); // Odd = contact/input

  return {
      isContactDetected: [ isContactDetected ], // TODO: isDigitalInput?
      uri: ELA_INNOVATION_URI
  }
}


/**
 * Process passive infrared frame containing PIR data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed PIR data as JSON.
 */
function processPassiveInfraredFrame(data) {
  if(data.length !== PIR_FRAME_LENGTH_BYTES) {
    return null;
  }

  let countAndState = data.readUInt16LE(FRAME_DATA_OFFSET);
  let eventCount = countAndState / 2;
  let isMotionDetected = ((countAndState % 2) === 1); // Odd = motion

  return {
      isMotionDetected: [ isMotionDetected ],
      uri: ELA_INNOVATION_URI
  }
}


/**
 * Process touch frame containing TOUCH data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed TOUCH data as JSON.
 */
function processTouchFrame(data) {
  if(data.length !== TOUCH_FRAME_LENGTH_BYTES) {
    return null;
  }

  let countAndState = data.readUInt16LE(FRAME_DATA_OFFSET);
  let eventCount = countAndState / 2;
  let isButtonPressed = ((countAndState % 2) === 1); // Odd = button pressed

  return {
      isButtonPressed: [ isButtonPressed ],
      uri: ELA_INNOVATION_URI
  }
}


/**
 * Process battery percentage containing BATT data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed BATT data as JSON.
 */
function processBatteryPercentFrame(data) {
  if(data.length !== BATT_PERCENT_FRAME_LENGTH_BYTES) {
    return null;
  }

  let batteryPercentage = data.readUInt8(FRAME_DATA_OFFSET);

  return {
      batteryPercentage: batteryPercentage,
      uri: ELA_INNOVATION_URI
  }
}


/**
 * Process battery voltage containing BATT data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed BATT data as JSON.
 */
function processBatteryVoltageFrame(data) {
  if(data.length !== BATT_VOLTAGE_FRAME_LENGTH_BYTES) {
    return null;
  }

  let batteryVoltage = data.readUInt16LE(FRAME_DATA_OFFSET) / 1000;

  return {
      batteryVoltage: batteryVoltage,
      uri: ELA_INNOVATION_URI
  }
}


module.exports.process = process;
