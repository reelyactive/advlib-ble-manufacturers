/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 1;
const HIBOUAIR_DATA_LENGTH_BYTES = 24;
const HIBOUAIR_BEACON_NUMBER = 5;
const BOARD_TYPE_OFFSET = 1;
const BOARD_ID_OFFSET = 2;
const BOARD_ID_LENGTH_BYTES = 3;
const SMART_SENSOR_DEVICES_URI =
                "https://sniffypedia.org/Organization/Smart_Sensor_Devices_AB/";


/**
 * Process Smart Sensor Devices manufacturer-specific data.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed Smart Sensor Devices data as JSON.
 */
function process(data) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_DATA_LENGTH_BYTES)) {
    return null;
  }

  let beaconNumber = buf.readUInt8();

  switch(beaconNumber) {
    case HIBOUAIR_BEACON_NUMBER:
      return processHibouAir(buf);
    default:
      return { uri: SMART_SENSOR_DEVICES_URI };
  }
}


/**
 * Process HibouAir data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed HibouAir data as JSON.
 */
function processHibouAir(data) {
  if(data.length !== HIBOUAIR_DATA_LENGTH_BYTES) {
    return null;
  }

  let hibouAir = { uri: SMART_SENSOR_DEVICES_URI };
  let boardType = data.readUInt8(BOARD_TYPE_OFFSET);
  let vocType = data.readUInt8(23);

  hibouAir.boardId = data.toString('hex', BOARD_ID_OFFSET,
                                   BOARD_ID_OFFSET + BOARD_ID_LENGTH_BYTES);
  if(boardType === 0x09) {
    hibouAir.soundPressure = 120 - data.readUInt16BE(5);
  }
  else {
    hibouAir.illuminance = data.readUInt16LE(5);
  }
  hibouAir.pressure = data.readUInt16LE(7) * 10;
  hibouAir.temperature = data.readUInt16LE(9) / 10;
  hibouAir.relativeHumidity = data.readUInt16LE(11) / 10;
  if(vocType === 0x02) { // ppm
    hibouAir.volatileOrganicCompoundsConcentration = data.readUInt16LE(13) /
                                                     100;
  }
  else if(vocType === 0x03) {
    // TODO: define VOC AQI standard property name
    // AQI = data.readUInt16LE(13);
  }
  if(boardType === 0x05) {
    // TODO: define particulate matter concentration standard property names
    // PM1 = data.readUInt16LE(15) / 10;
    // PM2.5 = data.readUInt16LE(17) / 10;
    // PM10 = data.readUInt16LE(19) / 10;
  }
  if(boardType === 0x05) {
    hibouAir.nitrogenDioxideConcentration = data.readUInt16BE(21);
  }
  else if((boardType === 0x04) || (boardType === 0x09)) {
    hibouAir.carbonDioxideConcentration	= data.readUInt16BE(21);
  }

  return hibouAir;
}


module.exports.process = process;
