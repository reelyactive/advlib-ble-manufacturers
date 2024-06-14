/**
 * Copyright reelyActive 2024
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 2;
const MOKOSMART_DATA_LENGTH_BYTES = 15;
const MOKOSMART_SUBTYPE_OFFSET = 11;
const NORDIC_SEMICONDUCTOR_URI = "https://sniffypedia.org/Organization/Nordic_Semiconductor_ASA/";


/**
 * Process MOKO Technology manufacturer-specific data.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed MOKO Technology data as JSON.
 */
function process(data) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_DATA_LENGTH_BYTES)) {
    return null;
  }

  let beaconCode = buf.readUInt16LE();
  switch(beaconCode) {
    case 0x6c07:
      return processMokoSmart(buf);
  }

  return null;
}


/**
 * Process MOKO Technology beacon data...
 * ...which piggybacks on Nordic Semiconductor manufacturer-specific data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processMokoSmart(data) {
  if(data.length !== MOKOSMART_DATA_LENGTH_BYTES) {
    return null;
  }

  let subtype = data.readUInt8(MOKOSMART_SUBTYPE_OFFSET);

  switch(subtype) {
    case 1:
      return {
        batteryVoltage: data.readUInt16LE(2) / 1000,
        distance: data.readUInt16LE(7) / 1000,
        uri: "https://sniffypedia.org/Organization/MOKO_Technology_Ltd/"
      }
    default:
      return null;
  }
}


module.exports.process = process;
