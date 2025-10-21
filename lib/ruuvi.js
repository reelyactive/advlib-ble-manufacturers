/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 1;
const DATA_FORMAT_RAW_V2 = 0x05;
const DATA_FORMAT_AIR = 0x06;
const RAW_V2_DATA_LENGTH_BYTES = 24;
const RAW_V2_TEMPERATURE_OFFSET = 1;
const RAW_V2_RELATIVE_HUMIDITY_OFFSET = 3;
const RAW_V2_PRESSURE_OFFSET = 5;
const RAW_V2_ACC_X_OFFSET = 7;
const RAW_V2_ACC_Y_OFFSET = 9;
const RAW_V2_ACC_Z_OFFSET = 11;
const RAW_V2_POWER_OFFSET = 13;
const RAW_V2_EVENT_COUNT_OFFSET = 15;
const RAW_V2_SEQ_OFFSET = 16;
const RAW_V2_MAC_OFFSET = 18;
const AIR_DATA_LENGTH_BYTES = 20;
const AIR_TEMPERATURE_OFFSET = 1;
const AIR_RELATIVE_HUMIDITY_OFFSET = 3;
const AIR_PRESSURE_OFFSET = 5;
const AIR_PM2_5_OFFSET = 7;
const AIR_CO2_OFFSET = 9;
const AIR_VOC_OFFSET = 11;
const AIR_NOX_OFFSET = 12;
const AIR_LUX_OFFSET = 13;
const AIR_SEQ_OFFSET = 15;
const AIR_FLAGS_OFFSET = 16;
const LUX_DELTA = Math.log(65536) / 254;
const RUUVI_URI = "https://sniffypedia.org/Organization/Ruuvi_Innovations_Ltd/";


/**
 * Process Ruuvi manufacturer-specific data.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed Ruuvi data as JSON.
 */
function process(data) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_DATA_LENGTH_BYTES)) {
    return null;
  }

  let dataFormat = buf.readUInt8();

  switch(dataFormat) {
    case DATA_FORMAT_RAW_V2:
      return processRawV2(buf);
    case DATA_FORMAT_AIR:
      return processAir(buf);
    default:
      return { uri: RUUVI_URI };
  }
}


/**
 * Process Ruuvi RAWv2 data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed Ruuvi RAWv2 data as JSON.
 */
function processRawV2(data) {
  if(data.length !== RAW_V2_DATA_LENGTH_BYTES) {
    return null;
  }

  let temperature = data.readInt16BE(RAW_V2_TEMPERATURE_OFFSET) / 200;
  let relativeHumidity = data.readUInt16BE(RAW_V2_RELATIVE_HUMIDITY_OFFSET)
                                                                         / 400;
  let pressure = data.readUInt16BE(RAW_V2_PRESSURE_OFFSET) + 50000;
  let accelerationX = data.readInt16BE(RAW_V2_ACC_X_OFFSET) / 1000;
  let accelerationY = data.readInt16BE(RAW_V2_ACC_Y_OFFSET) / 1000;
  let accelerationZ = data.readInt16BE(RAW_V2_ACC_Z_OFFSET) / 1000;
  let powerInfo = data.readUInt16BE(RAW_V2_POWER_OFFSET);
  let batteryVoltage = (1600 + (powerInfo >> 5)) / 1000;
  let txPower = (2 * (powerInfo & 0x1f)) - 40;
  let eventCount = data.readUInt8(RAW_V2_EVENT_COUNT_OFFSET);
  let measurementSequenceNumber = data.readUInt16BE(RAW_V2_SEQ_OFFSET);
  let deviceId = data.toString('hex', RAW_V2_MAC_OFFSET);

  // TODO: exclude any invalid values
  return {
      temperature: temperature,
      relativeHumidity: relativeHumidity,
      pressure: pressure,
      acceleration: [ accelerationX, accelerationY, accelerationZ ],
      batteryVoltage: batteryVoltage,
      txPower: txPower,
      txCount: measurementSequenceNumber,
      deviceIds: [ deviceId ],
      uri: "https://sniffypedia.org/Product/Ruuvi_RuuviTag/"
  };
}


/**
 * Process Ruuvi Air data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed Ruuvi Air data as JSON.
 */
function processAir(data) {
  if(data.length !== AIR_DATA_LENGTH_BYTES) {
    return null;
  }

  let flags = data.readUInt8(AIR_FLAGS_OFFSET);
  let volatileOrganicCompoundsIndex = data.readUInt8(AIR_VOC_OFFSET) * 2
                                                       + ((flags & 0x40) >> 6);
  let nitrogenOxideIndex = data.readUInt8(AIR_NOX_OFFSET) * 2
                                                       + ((flags & 0x80) >> 7);
  let measurementSequenceNumber = data.readUInt8(AIR_SEQ_OFFSET);
  let ruuviAir = { txCount: measurementSequenceNumber,
                   uri: "https://sniffypedia.org/Product/Ruuvi_Air/" };

  if(data.readInt16BE(AIR_TEMPERATURE_OFFSET) !== 0x8000) {
    ruuviAir.temperature = data.readInt16BE(AIR_TEMPERATURE_OFFSET) / 200;
  }
  if(data.readUInt16BE(AIR_RELATIVE_HUMIDITY_OFFSET) !== 0xffff) {
    ruuviAir.relativeHumidity = data.readUInt16BE(AIR_RELATIVE_HUMIDITY_OFFSET)
                                / 400;
  }
  if(data.readUInt16BE(AIR_PRESSURE_OFFSET) !== 0xffff) {
    ruuviAir.pressure = data.readUInt16BE(AIR_PRESSURE_OFFSET) + 50000;
  }
  if(data.readUInt16BE(AIR_PM2_5_OFFSET) !== 0xffff) {
    ruuviAir["pm2.5"] = data.readInt16BE(AIR_PM2_5_OFFSET) / 10;
  }
  if(data.readUInt16BE(AIR_CO2_OFFSET) !== 0xffff) {
    ruuviAir.carbonDioxideConcentration = data.readInt16BE(AIR_CO2_OFFSET);
  }
  if(volatileOrganicCompoundsIndex !== 0x1ff) {
    // Formula from Sensirion for Molhave in ppm
    ruuviAir.volatileOrganicCompoundsConcentration =
      0.58 * (Math.log(501 - volatileOrganicCompoundsIndex) - 6.24) * -0.38197;
  }
  if(nitrogenOxideIndex !== 0x1ff) {
    // Nitrogen oxide index cannot be converted to absolute concentration
    ruuviAir.nitrogenOxideIndex = nitrogenOxideIndex;
  }
  if(data.readUInt8(AIR_LUX_OFFSET) !== 0xff) {
    ruuviAir.illuminance = Math.exp(data.readUInt8(AIR_LUX_OFFSET) * LUX_DELTA)
                                                               .toFixed(2) - 1;
  }

  return ruuviAir;
}


module.exports.process = process;
