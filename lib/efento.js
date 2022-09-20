/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 7;
const BLUETOOTH_SENSOR_DATA_LENGTH_BYTES = 24;
const DECODING_ADVERTISING_FRAME_DATA_LENGTH_BYTES = 24;
const BLUETOOTH_SENSOR_MANUFACTURING_DATA_VERSION = 0x02;
const DECODING_ADVERTISING_MANUFACTURING_DATA_VERSION = 0x03;
const DECODING_SCAN_RESPONSE_MANUFACTURING_DATA_VERSION = 0x04;
const SOFTWARE_VERSION_MAJOR_OFFSET = 1;
const SOFTWARE_VERSION_MINOR_OFFSET = 2;
const MEASUREMENT_COUNTER_OFFSET = 4;
const MEASUREMENT_PERIOD_OFFSET = 8;
const SENSOR_TYPES_OFFSET = 11;
const MEASUREMENT_SLOTS_OFFSET = 14;
const NUMBER_OF_SENSORS = 3;
const DECODING_ADVERTISING_FRAME_MAC_OFFSET = 1;
const DECODING_SCAN_RESPONSE_FRAME_MEASUREMENT_OFFSET = 1;
const CRC16_LENGTH_BYTES = 2;
const IDENTIFIER_TYPE_EUI_48 = 2;
const EFENTO_URI = "https://sniffypedia.org/Organization/Efento_Sp_zoo/";


/**
 * Process Efento manufacturer-specific data.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed Efento data as JSON.
 */
function process(data) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_DATA_LENGTH_BYTES)) {
    return null;
  }

  let manufacturingDataVersion = buf.readUInt8();

  switch(manufacturingDataVersion) {
    case BLUETOOTH_SENSOR_MANUFACTURING_DATA_VERSION:
      return processBluetoothSensor(buf);
    case DECODING_ADVERTISING_MANUFACTURING_DATA_VERSION:
      return processDecodingAdvertisingFrame(buf);
    case DECODING_SCAN_RESPONSE_MANUFACTURING_DATA_VERSION:
      return processDecodingScanResponseFrame(buf);
    default:
      return null;
  }
}


/**
 * Process Efento Bluetooth Sensor data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed Efento data as JSON.
 */
function processBluetoothSensor(data) {
  if(data.length !== BLUETOOTH_SENSOR_DATA_LENGTH_BYTES) {
    return null;
  }

  let efentoSensor = { uri: EFENTO_URI };
  efentoSensor.version = data.readUInt8(SOFTWARE_VERSION_MAJOR_OFFSET) + '.' +
                         data.readUInt8(SOFTWARE_VERSION_MINOR_OFFSET);
  efentoSensor.txCount = data.readUInt32BE(MEASUREMENT_COUNTER_OFFSET);

  let measurementPeriod = data.readUInt16BE(MEASUREMENT_PERIOD_OFFSET);
  let isInSeconds = (measurementPeriod >= 0x8000);
  measurementPeriod &= 0x7fff;
  efentoSensor.measurementPeriodSeconds = (isInSeconds ? measurementPeriod :
                                                        measurementPeriod * 60);

  for(let sensorCount = 0; sensorCount < NUMBER_OF_SENSORS; sensorCount++) {
    let sensorType = data.readUInt8(SENSOR_TYPES_OFFSET + sensorCount);
    let measurementIndex = MEASUREMENT_SLOTS_OFFSET + (sensorCount * 2);
    let measurement = data.subarray(measurementIndex, measurementIndex + 2);
    Object.assign(efentoSensor, processMeasurement(sensorType, measurement));
  }

  return efentoSensor;
}


/**
 * Process Efento decoding advertising frame data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed Efento data as JSON.
 */
function processDecodingAdvertisingFrame(data) {
  if(data.length !== DECODING_ADVERTISING_FRAME_DATA_LENGTH_BYTES) {
    return null;
  }

  let efentoSensor = { uri: EFENTO_URI };
  let macSignature = toMacSignature(data,
                                    DECODING_ADVERTISING_FRAME_MAC_OFFSET);

  efentoSensor.deviceIds = [ macSignature ];

  return efentoSensor;
}


/**
 * Process Efento decoding scan response frame data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed Efento data as JSON.
 */
function processDecodingScanResponseFrame(data) {
  let efentoSensor = { uri: EFENTO_URI };
  let crcOffset = data.length - CRC16_LENGTH_BYTES;
  let measurementIndex = DECODING_SCAN_RESPONSE_FRAME_MEASUREMENT_OFFSET;

  while(measurementIndex < crcOffset) {
    let sensorType = data.readUInt8(measurementIndex);
    let measurement = data.subarray(measurementIndex + 1, measurementIndex + 3);
    Object.assign(efentoSensor, processMeasurement(sensorType, measurement));

    measurementIndex += 3;
  }

  return efentoSensor;
}


/**
 * Process measurement based on the given sensor type.
 * @param {Number} sensorType The type of sensor that produced the measurement.
 * @param {Buffer} measurement The raw measurement data to process.
 * @return {Object} The processed measurement data as JSON.
 */
function processMeasurement(sensorType, measurement) {
  switch(sensorType) {
    case 0x00: // None
      return;
    case 0x01: // Temperature
      let temperature = (measurement.readUInt16BE() / 100) - 150;
      if(temperature <= 150) {
        return { temperature: temperature };
      }
      break;
    case 0x02: // Humidity
      let relativeHumidity = measurement.readUInt16BE();
      if(relativeHumidity <= 100) {
        return { relativeHumidity: relativeHumidity };
      }
      break;
    case 0x03: // Pressure
      let pressure = measurement.readUInt16BE() * 10;
      if(pressure <= 652790) {
        return { pressure: pressure };
      }
      break;
    case 0x04: // Differential pressure
      let differentialPressure = measurement.readUInt16BE() - 0x8000;
      if((differentialPressure >= -32512) && (differentialPressure <= 32511)) {
        return { differentialPressure: differentialPressure };
      }
      break;
    case 0x05: // Alarm
      break;   // TODO: support in future?
    case 0x06: // Indoor Air Quality
      break;   // TODO: support in future?
    case 0x07: // Water leakage
      break;   // TODO: support in future?
    case 0x08: // Pulse counter
      break;   // TODO: support in future?
    case 0x09: // Watt-Hours
      break;   // TODO: support in future?
    case 0x0a: // Water counter
      break;   // TODO: support in future?
    case 0x0b: // Soil moisture
      break;   // TODO: support in future?
    case 0x16: // High pressure
      break;   // TODO: support in future?
  }
}


/**
 * Convert the given 48-bit data into a MAC address signature.
 * @param {Buffer} data The buffer containing the big-endian MAC address.
 * @param {Integer} index The index to the start of the MAC address.
 * @return {String} The MAC address signature.
 */
function toMacSignature(data, index) {
  return data.toString('hex', index + 0, index + 1) +
         data.toString('hex', index + 1, index + 2) +
         data.toString('hex', index + 2, index + 3) +
         data.toString('hex', index + 3, index + 4) +
         data.toString('hex', index + 4, index + 5) +
         data.toString('hex', index + 5, index + 6) +
         '/' + IDENTIFIER_TYPE_EUI_48;
}


module.exports.process = process;
