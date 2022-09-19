/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 24;
const BLUETOOTH_SENSOR_MANUFACTURING_DATA_VERSION = 0x02;
const SOFTWARE_VERSION_MAJOR_OFFSET = 1;
const SOFTWARE_VERSION_MINOR_OFFSET = 2;
const MEASUREMENT_COUNTER_OFFSET = 4;
const MEASUREMENT_PERIOD_OFFSET = 8;
const SENSOR_TYPES_OFFSET = 11;
const MEASUREMENT_SLOTS_OFFSET = 14;
const NUMBER_OF_SENSORS = 3;
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
  if(manufacturingDataVersion !== BLUETOOTH_SENSOR_MANUFACTURING_DATA_VERSION) {
    return null;
  }

  let efentoSensor = { uri: EFENTO_URI };
  efentoSensor.version = buf.readUInt8(SOFTWARE_VERSION_MAJOR_OFFSET) + '.' +
                         buf.readUInt8(SOFTWARE_VERSION_MINOR_OFFSET);
  efentoSensor.txCount = buf.readUInt32BE(MEASUREMENT_COUNTER_OFFSET);

  let measurementPeriod = buf.readUInt16BE(MEASUREMENT_PERIOD_OFFSET);
  let isInSeconds = (measurementPeriod >= 0x8000);
  measurementPeriod &= 0x7fff;
  efentoSensor.measurementPeriodSeconds = (isInSeconds ? measurementPeriod :
                                                        measurementPeriod * 60);

  for(let sensorIndex = 0; sensorIndex < NUMBER_OF_SENSORS; sensorIndex++) {
    let sensorType = buf.readUInt8(SENSOR_TYPES_OFFSET + sensorIndex);
    let measurementIndex = MEASUREMENT_SLOTS_OFFSET + (sensorIndex * 2);
    let measurement = buf.subarray(measurementIndex, measurementIndex + 2);
    Object.assign(efentoSensor, processMeasurement(sensorType, measurement));
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


module.exports.process = process;
