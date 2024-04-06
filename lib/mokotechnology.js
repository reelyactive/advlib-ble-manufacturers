/**
 * Copyright reelyActive 2023-2024
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 1;
const FRAME_LENGTH_OFFSET = 1;
const DEVICE_STATUS_OFFSET = 2;
const MAC_OFFSET = 4;
const BATTERY_VOLTAGE_OFFSET = 16;
const CONTACT_DETECTED_MASK = 0x08;
const MOTION_DETECTED_MASK = 0x01;
const IDENTIFIER_TYPE_RND_48 = 3;
const MOKO_TECHNOLOGY_URI = "https://sniffypedia.org/Organization/MOKO_Technology_Ltd/";


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

  let frameType = buf.readUInt8();
  switch(frameType) {
    case 0x02:
      return processProximityBeacon(buf);
  }

  return null;
}


/**
 * Process MOKO Technology proximity beacon data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processProximityBeacon(data) {
  let frameLength = data.readUInt8(FRAME_LENGTH_OFFSET);

  if(data.length !== (frameLength + FRAME_LENGTH_OFFSET + 1)) {
    return null;
  }

  let deviceStatus = data.readUInt8(DEVICE_STATUS_OFFSET);

  let isContactDetected = !((deviceStatus & CONTACT_DETECTED_MASK) ===
                            CONTACT_DETECTED_MASK);
  let isMotionDetected = ((deviceStatus & MOTION_DETECTED_MASK) ===
                          MOTION_DETECTED_MASK);
  let macSignature = toMacSignature(data, MAC_OFFSET);
  let batteryVoltage = data.readUInt16BE(BATTERY_VOLTAGE_OFFSET) / 1000;

  return {
      batteryVoltage: batteryVoltage,
      deviceIds: [ macSignature ],
      isContactDetected: [ isContactDetected ],
      isMotionDetected: [ isMotionDetected ],
      uri: MOKO_TECHNOLOGY_URI
  };
}


/**
 * Convert the given 48-bit data into a MAC address signature.
 * @param {Buffer} data The buffer containing the little-endian MAC address.
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
         '/' + IDENTIFIER_TYPE_RND_48;
}


module.exports.process = process;
