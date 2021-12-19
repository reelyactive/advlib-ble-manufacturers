/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 1;
const MAX_SENSOR_STATUS_LENGTH_BYTES = 19;
const SEQUENCE_COUNTER_LENGTH_BYTES = 4;
const SECURITY_SIGNATURE_LENGTH_BYTES = 4;
const COMMAND_AND_CONTROL_TYPE_ID_START = 0x30;
const TYPE_ID_DEVICE_STATUS = 0x39;
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
      if((value !== 0x8000) && (value !== 0x7fff)) {
        processedPacket.temperature = value / 100;
      }
      break;
    case 0x01: // Voltage
      value = data.readInt16LE(valueFieldOffset);
      if((value !== 0x8000) && (value !== 0x7fff)) {
        processedPacket.batteryVoltage = value / 2000;
      }
      break;
    case 0x02: // Battery Percentage
      value = data.readUInt8(valueFieldOffset);
      if((value !== 0xff) && (value !== 0xfe)) {
        processedPacket.batteryPercentage = value / 2;
      }
      break;
    case 0x03: // Current
      value = data.readInt16LE(valueFieldOffset);
      // TODO
      break;
    case 0x04: // Illuminance (solar cell)
      value = data.readUInt16LE(valueFieldOffset);
      if((value !== 0xffff) && (value !== 0xfffe)) {
        processedPacket.illuminance = value;
      }
      break;
    case 0x05: // Illuminance (sensor)
      value = data.readUInt16LE(valueFieldOffset);
      if((value !== 0xffff) && (value !== 0xfffe)) {
        processedPacket.illuminance = value;
      }
      break;
    case 0x06: // Relative Humidity
      value = data.readUInt8(valueFieldOffset);
      if((value !== 0xff) && (value !== 0xfe)) {
        processedPacket.relativeHumidity = value / 2;
      }
      break;
    case 0x07: // Pressure
      value = data.readInt16LE(valueFieldOffset);
      if((value < 32767) && (value > -32768)) {
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
      let isSensorDisabled = ((value & 0xc000) === 0xc000);
      if(!isSensorDisabled) {
        processedPacket.acceleration = [
          ((value & 0x3ff) - 512) / 100,
          (((value >> 10) & 0x3ff) - 512) / 100,
          (((value >> 20) & 0x3ff) - 512) / 100
        ];
      }
      // TODO
      break;
    case 0x0b: // Resistance
      value = data.readUInt32LE(valueFieldOffset);
      // TODO
      break;
    case 0x09: // Capacitance
      value = data.readUInt32LE(valueFieldOffset);
      // TODO
      break;
    default:
  }

  return valueFieldOffset + valueFieldLength;
}


module.exports.process = process;