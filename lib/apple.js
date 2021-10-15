/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 1;
const FRAME_LENGTH_OFFSET = 1;
const IBEACON_LENGTH = 21;
const IBEACON_FRAME_LENGTH = 23;
const IBEACON_UUID_OFFSET = 2;
const IBEACON_MAJOR_OFFSET = 18;
const IBEACON_MINOR_OFFSET = 20;
const IBEACON_TX_POWER_OFFSET = 22;
const IBEACON_UUID_LENGTH = 16;
const IBEACON_MAJOR_LENGTH = 2;
const IBEACON_MINOR_LENGTH = 2;


/**
 * Process Apple manufacturer-specific data.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed Apple data as JSON.
 */
function process(data) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_DATA_LENGTH_BYTES)) {
    return null;
  }

  let frameType = buf.readUInt8();
  switch(frameType) {
    case 0x02:
      return processIBeacon(buf);
    case 0x03: // AirPrint
      return {
          uri: "https://sniffypedia.org/Organization/Apple_Inc/AirPrint/"
      };
    case 0x05: // AirDrop
      return { uri: "https://sniffypedia.org/Organization/Apple_Inc/" };
    case 0x06: // HomeKit
      return { uri: "https://sniffypedia.org/Organization/Apple_Inc/HomeKit/" };
    case 0x07: // Proximity Pairing (audio devices)
      return { uri: "https://sniffypedia.org/Product/Apple_AirPods/" };
    case 0x08: // "Hey Siri"
      return { uri: "https://sniffypedia.org/Organization/Apple_Inc/" };
    case 0x09: // AirPlay
    case 0x0a: // AirPlay
      return { uri: "https://sniffypedia.org/Organization/Apple_Inc/AirPlay/" };
    case 0x0b: // Magic Switch (watch)
      return { uri: "https://sniffypedia.org/Product/Apple_Watch/" };
    case 0x0c: // Handoff
      return { uri: "https://sniffypedia.org/Organization/Apple_Inc/" };
    case 0x0d: // Tethering Target Presence
    case 0x0e: // Tethering Source Presence
      return { uri: "https://sniffypedia.org/Organization/Apple_Inc/" };
    case 0x0f: // Nearby Action
    case 0x10: // Nearby Info
      return { uri: "https://sniffypedia.org/Organization/Apple_Inc/" };
  }

  return null;
}


/**
 * Process iBeacon data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed iBeacon data as JSON.
 */
function processIBeacon(data) {
  let isInvalidLength = (data.length !== IBEACON_FRAME_LENGTH) ||
                        (data.readInt8(FRAME_LENGTH_OFFSET) !== IBEACON_LENGTH);
  if(isInvalidLength) {
    return null;
  }

  let uuid = data.toString('hex', IBEACON_UUID_OFFSET,
                           IBEACON_UUID_OFFSET + IBEACON_UUID_LENGTH);
  let major = data.toString('hex', IBEACON_MAJOR_OFFSET,
                            IBEACON_MAJOR_OFFSET + IBEACON_MAJOR_LENGTH);
  let minor = data.toString('hex', IBEACON_MINOR_OFFSET,
                            IBEACON_MINOR_OFFSET + IBEACON_MINOR_LENGTH);
  let deviceId = uuid + utils.SIGNATURE_SEPARATOR + major +
                 utils.SIGNATURE_SEPARATOR + minor;
  let txPower = data.readInt8(IBEACON_TX_POWER_OFFSET);

  return {
      deviceIds: [ deviceId ],
      txPower: txPower,
      uri: "https://sniffypedia.org/Organization/Apple_Inc/iBeacon/"
  };
}


module.exports.process = process;