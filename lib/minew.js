/**
 * Copyright reelyActive 2021
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 1;
const S4_STATIC_FRAME_LENGTH = 18;
const S4_DOOR_ALARM_FRAME_LENGTH = 15;
const FRAME_VERSION_OFFSET = 1;
const FIRMWARE_VERSION_OFFSET = 2;
const HARDWARE_VERSION_OFFSET = 5;
const BATTERY_PERCENTAGE_OFFSET = 2;
const DOOR_MAGNET_ALARM_OFFSET = 3;
const ANTI_DISASSEMBLY_ALARM_OFFSET = 4;
const ALARM_TRIGGER_OFFSET = 5;
const S4_STATIC_MAC_OFFSET = 10;
const S4_DOOR_ALARM_MAC_OFFSET = 7;
const IDENTIFIER_TYPE_EUI_48 = 2;
const MINEW_URI = "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/";


/**
 * Process Minew manufacturer-specific data.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed Minew data as JSON.
 */
function process(data) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_DATA_LENGTH_BYTES)) {
    return null;
  }

  let frameType = buf.readUInt8();
  switch(frameType) {
    case 0xa4:
      return processS4(buf);
  }

  return null;
}


/**
 * Process Minew S4 data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed iBeacon data as JSON.
 */
function processS4(data) {
  let frameVersion = data.readUInt8(FRAME_VERSION_OFFSET);

  if((frameVersion === 0) &&      // Static information frame
     (data.length === S4_STATIC_FRAME_LENGTH)) {
    let firmwareVersion = data.readUInt8(FIRMWARE_VERSION_OFFSET) + '.' +
                          data.readUInt8(FIRMWARE_VERSION_OFFSET + 1) + '.' +
                          data.readUInt8(FIRMWARE_VERSION_OFFSET + 2);
    let hardwareVersion = data.readUInt16BE(HARDWARE_VERSION_OFFSET);
    let macSignature = toMacSignature(data, S4_STATIC_MAC_OFFSET);

    return {
        deviceIds: [ macSignature ],
        uri: MINEW_URI,
        version: firmwareVersion
    };
  }
  else if((frameVersion === 1) && // Door alarm frame
          (data.length === S4_DOOR_ALARM_FRAME_LENGTH)) {
    let batteryPercentage = data.readUInt8(BATTERY_PERCENTAGE_OFFSET);
    let isDoorMagnetAlarm = (data.readUInt8(DOOR_MAGNET_ALARM_OFFSET) > 0);
    let isAntiDisassemblyAlarm = (data.readUInt8(
                                            ANTI_DISASSEMBLY_ALARM_OFFSET) > 0);
    let isCurrentAlarmTrigger = (data.readUInt8(ALARM_TRIGGER_OFFSET) > 0);
    let macSignature = toMacSignature(data, S4_DOOR_ALARM_MAC_OFFSET);

    return {
        batteryPercentage: batteryPercentage,
        deviceIds: [ macSignature ],
        isContactDetected: [ !isDoorMagnetAlarm ],
        uri: MINEW_URI
    };
  }

  return null;
}


/**
 * Convert the given 48-bit data into a MAC address signature.
 * @param {Buffer} data The buffer containing the little-endian MAC address.
 * @param {Integer} index The index to the start of the MAC address.
 * @return {String} The MAC address signature.
 */
function toMacSignature(data, index) {
  return data.toString('hex', index + 5, index + 6) +
         data.toString('hex', index + 4, index + 5) +
         data.toString('hex', index + 3, index + 4) +
         data.toString('hex', index + 2, index + 3) +
         data.toString('hex', index + 1, index + 2) +
         data.toString('hex', index + 0, index + 1) +
         '/' + IDENTIFIER_TYPE_EUI_48;
}


module.exports.process = process;