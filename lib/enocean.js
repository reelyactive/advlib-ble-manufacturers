/**
 * Copyright reelyActive 2015-2022
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 9;
const PTM_215B_MIN_DATA_LENGTH_BYTES = 9;
const MAX_SENSOR_STATUS_LENGTH_BYTES = 19;
const SEQUENCE_COUNTER_LENGTH_BYTES = 4;
const SECURITY_SIGNATURE_LENGTH_BYTES = 4;
const COMMAND_AND_CONTROL_TYPE_ID_START = 0x30;
const TYPE_ID_DEVICE_STATUS = 0x39;
const SWITCH_STATUS_ACTION_TYPE_MASK = 0x01;
const SINT16_OOB = 32767;
const SINT16_INVALID = -32768;
const UINT16_OOB = 0xffff;
const UINT16_INVALID = 0xfffe;
const UINT8_OOB = 0xff;
const UINT8_INVALID = 0xfe;
const ENOCEAN_URI = "https://sniffypedia.org/Organization/EnOcean_GmbH/";


/**
 * Process EnOcean manufacturer-specific data.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed EnOcean data as JSON.
 */
function process(data) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_DATA_LENGTH_BYTES)) {
    return null;
  }

  // The PTM 215B module does not observe the BLE Sensor Protocol Specification,
  // but can be inferred, with care, by its shorter length.
  if(buf.length === PTM_215B_MIN_DATA_LENGTH_BYTES) {
    return processPtm215B(buf);
  }

  let processedPacket = { txCount: buf.readUInt32LE(), uri: ENOCEAN_URI };
  let offset = SEQUENCE_COUNTER_LENGTH_BYTES;
  let dataTypeId = buf.readUInt8(offset) & 0x3f;
  let isInputSignal = (dataTypeId < COMMAND_AND_CONTROL_TYPE_ID_START);

  if(isInputSignal) {
    let securitySignatureOffset = buf.length - SECURITY_SIGNATURE_LENGTH_BYTES;

    while(offset < securitySignatureOffset) {
      offset = processSensorDataItem(buf, offset, processedPacket);
    }

    processedPacket.securitySignature = buf.toString('hex',
                                                     securitySignatureOffset);
  }
  else if(dataTypeId === TYPE_ID_DEVICE_STATUS) {
    let illuminance = buf.readUInt16LE(offset + 6);
    let batteryPercentage = buf.readUInt8(offset + 8);

    processedPacket.uptime = buf.readUInt32LE(offset + 2);

    if((illuminance !== 0xffff) && (illuminance !== 0xfffe)) {
      processedPacket.illuminance = illuminance;
    }
    if((batteryPercentage !== 0xff) && (batteryPercentage !== 0xfe)) {
      processedPacket.batteryPercentage = batteryPercentage;
    }
  }

  // TODO: handle remaining command and control telegrams

  return processedPacket;
}


/**
 * Process a single EnOcean sensor data item.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @param {Number} offset The offset of the sensor data descriptor.
 * @param {Object} processedPacket The packet to update with the sensor data.
 * @return {Object} The processed EnOcean data as JSON.
 */
function processSensorDataItem(data, offset, processedPacket) {
  let dataDescriptor = data.readUInt8(offset);
  let valueFieldLength;
  let valueFieldOffset = offset + 1;
  let dataSize = (dataDescriptor >> 6) & 0x3;
  let dataTypeId = dataDescriptor & 0x3f;
  let value;

  if(dataSize < 3) {
    valueFieldLength = Math.pow(2, dataSize);
  }
  else {
    valueFieldLength = data.readUInt8(offset + 1);
    valueFieldOffset++;
  }

  switch(dataTypeId) {
    case 0x00: // Temperature
      value = data.readInt16LE(valueFieldOffset);
      if((value !== SINT16_OOB) && (value !== SINT16_INVALID)) {
        processedPacket.temperature = value / 100;
      }
      break;
    case 0x01: // Voltage
      value = data.readInt16LE(valueFieldOffset);
      if((value !== SINT16_OOB) && (value !== SINT16_INVALID)) {
        processedPacket.batteryVoltage = value / 2000;
      }
      break;
    case 0x02: // Battery Percentage
      value = data.readUInt8(valueFieldOffset);
      if((value !== UINT8_OOB) && (value !== UINT8_INVALID)) {
        processedPacket.batteryPercentage = value / 2;
      }
      break;
    case 0x03: // Current
      value = data.readInt16LE(valueFieldOffset);
      // TODO
      break;
    case 0x04: // Illuminance (solar cell)
      value = data.readUInt16LE(valueFieldOffset);
      if((value !== UINT16_OOB) && (value !== UINT16_INVALID)) {
        processedPacket.illuminance = value;
      }
      break;
    case 0x05: // Illuminance (sensor)
      value = data.readUInt16LE(valueFieldOffset);
      if((value !== UINT16_OOB) && (value !== UINT16_INVALID)) {
        processedPacket.illuminance = value;
      }
      break;
    case 0x06: // Relative Humidity
      value = data.readUInt8(valueFieldOffset);
      if((value !== UINT8_OOB) && (value !== UINT8_INVALID)) {
        processedPacket.relativeHumidity = value / 2;
      }
      break;
    case 0x07: // Pressure
      value = data.readInt16LE(valueFieldOffset);
      if((value !== SINT16_OOB) && (value !== SINT16_INVALID)) {
        processedPacket.pressure = value * 100;
      }
      break;
    case 0x08: // Distance
      value = data.readUInt16LE(valueFieldOffset);
      // TODO
      break;
    case 0x09: // Concentration
      value = data.readUInt32LE(valueFieldOffset);
      // TODO
      break;
    case 0x0a: // Acceleration
      value = data.readUInt32LE(valueFieldOffset);
      let statusCode = (value >> 30) & 0x3;
      let isTimedUpdate = (statusCode === 0x1);
      let isThresholdUpdate = (statusCode === 0x2);
      if(isTimedUpdate || isThresholdUpdate) {
        processedPacket.acceleration = [
          ((value & 0x3ff) - 512) / 100,
          (((value >> 10) & 0x3ff) - 512) / 100,
          (((value >> 20) & 0x3ff) - 512) / 100
        ];
        processedPacket.isMotionDetected = [ isThresholdUpdate ];
      }
      break;
    case 0x0b: // Resistance
      value = data.readUInt32LE(valueFieldOffset);
      // TODO
      break;
    case 0x0c: // Capacitance
      value = data.readUInt32LE(valueFieldOffset);
      // TODO
      break;
    case 0x20: // Occupancy
      value = data.readUInt8(valueFieldOffset);
      if(value === 0x01) {
        processedPacket.isMotionDetected = [ false ];
      }
      else if(value === 0x02) {
        processedPacket.isMotionDetected = [ true ];
      }
      break;
    case 0x21: // Alarm
      value = data.readUInt8(valueFieldOffset);
      // TODO
      break;
    case 0x22: // Mechanical handle
      value = data.readUInt8(valueFieldOffset);
      // TODO
      break;
    case 0x23: // Contact (sensor)
      value = data.readUInt8(valueFieldOffset);
      if(value === 0x01) {
        processedPacket.isContactDetected = [ false ];
      }
      else if(value === 0x02) {
        processedPacket.isContactDetected = [ true ];
      }
      break;
    case 0x24: // Button (user input)
      value = data.readUInt8(valueFieldOffset);
      // TODO
      break;
    default:
  }

  return valueFieldOffset + valueFieldLength;
}


/**
 * Process EnOcean PTM 215B module manufacturer-specific data.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed EnOcean data as JSON.
 */
function processPtm215B(data) {
  let processedPacket = { txCount: data.readUInt32LE(), uri: ENOCEAN_URI };
  let switchStatus = data.readUInt8(SEQUENCE_COUNTER_LENGTH_BYTES);
  let securitySignatureOffset = data.length - SECURITY_SIGNATURE_LENGTH_BYTES;

  if((switchStatus & 0xe0) !== 0) {
    return null;
  }

  processedPacket.isButtonPressed = [ false, false, false, false ];

  let isPressAction = Boolean(switchStatus & SWITCH_STATUS_ACTION_TYPE_MASK);

  if(isPressAction) {
    processedPacket.isButtonPressed[0] = Boolean(switchStatus & 0x02);
    processedPacket.isButtonPressed[1] = Boolean(switchStatus & 0x04);
    processedPacket.isButtonPressed[2] = Boolean(switchStatus & 0x08);
    processedPacket.isButtonPressed[3] = Boolean(switchStatus & 0x10);
  }

  processedPacket.securitySignature = data.toString('hex',
                                                    securitySignatureOffset);

  return processedPacket;
}


module.exports.process = process;