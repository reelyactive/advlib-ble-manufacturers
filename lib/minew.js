/**
 * Copyright reelyActive 2021-2025
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 1;
const MSE_FRAME_LENGTH = 4;
const S3_STATIC_FRAME_LENGTH = 20;
const S3_TEMPERATURE_HUMIDITY_FRAME_LENGTH = 16;
const S4_STATIC_FRAME_LENGTH = 18;
const S4_DOOR_ALARM_FRAME_LENGTH = 15;
const FRAME_VERSION_OFFSET = 1;
const FIRMWARE_VERSION_OFFSET = 2;
const HARDWARE_VERSION_OFFSET = 5;
const BATTERY_PERCENTAGE_OFFSET = 2;
const DOOR_MAGNET_ALARM_OFFSET = 3;
const ANTI_DISASSEMBLY_ALARM_OFFSET = 4;
const ALARM_TRIGGER_OFFSET = 5;
const S3_TEMPERATURE_OFFSET = 3;
const S3_HUMIDITY_OFFSET = 5;
const S3_STATIC_MAC_OFFSET = 12;
const S3_TEMPERATURE_HUMIDITY_MAC_OFFSET = 7;
const S4_STATIC_MAC_OFFSET = 10;
const S4_DOOR_ALARM_MAC_OFFSET = 7;
const V3_00_FRAME_LENGTH = 24;
const V3_05_FRAME_LENGTH = 24;
const V3_18_FRAME_LENGTH = 24;
const V3_1B_FRAME_LENGTH = 24;
const V3_SUBFRAME_VERSION_OFFSET = 2;
const V3_00_MAC_OFFSET = 2;
const V3_00_BATTERY_PERCENTAGE_OFFSET = 8;
const V3_00_FIRMWARE_VERSION_OFFSET = 9;
const V3_03_MIN_FRAME_LENGTH = 6;
const V3_03_POST_BLOCK_LENGTH = 4;
const V3_05_DEVICE_INFO_OFFSET = 3;
const V3_05_TEMPERATURE_OFFSET = 5;
const V3_05_HUMIDITY_OFFSET = 7;
const V3_05_NAME_OFFSET = 9;
const V3_05_MARK_OFFSET = 17;
const V3_05_NAME_LENGTH = 8;
const V3_05_DEVICE_INFO_TEMPERATURE_ONLY_MASK = 0x02;
const V3_18_SERIAL_NUMBER_OFFSET = 3;
const V3_18_NUMBER_OF_ENTRIES_OFFSET = 4;
const V3_18_NUMBER_OF_EXITS_OFFSET = 6;
const V3_18_NUMBER_OF_PEOPLE_OFFSET = 4;
const V3_1B_SUBVERSION_OFFSET = 2;
const V3_1B_PRODUCT_ID_OFFSET = 3;
const V3_1B_STATIC_MAC_OFFSET = 6;
const V3_1B_BATTERY_VOLTAGE_OFFSET = 12;
const V3_1B_TEMPERATURE_OFFSET = 14;
const V3_1B_TX_POWER_OFFSET = 17;
const V3_1B_ENCRYPTION_MASK = 0x80;

const IDENTIFIER_TYPE_EUI_48 = 2;
const MINEW_URI = "https://sniffypedia.org/Organization/Shenzhen_Minew_Technologies_Co_Ltd/";
const V3_PRODUCT_URIS = new Map([
  [ 0x007, "https://sniffypedia.org/Product/Minew_MTB02/" ]
]);
const V3_BLOCKS = new Map([
  [ 0x03, { length: 7, process: processV3Block03 } ],
  [ 0x21, { length: 2, process: processV3Block21 } ],
  [ 0x22, { length: 2, process: processV3Block22 } ]
]);


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
    case 0x01:
    case 0x02:
      return processMSE(buf);
    case 0xa3:
      return processS3(buf);
    case 0xa4:
      return processS4(buf);
    case 0xca:
      return processConnectV3(buf);
  }

  return null;
}


/**
 * Process Minew MSE sensor data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processMSE(data) {
  if(data.length !== MSE_FRAME_LENGTH) {
    return null;
  }

  // TODO: select uri based on model (0x01 = MSE01, 0x02 = MSE02)

  let txCount = data.readUInt8(1);
  let batteryPercentage = data.readUInt8(2);
  let sensorStatus = data.readUInt8(3);
  let isButtonPressed = [ (sensorStatus & 0x20) === 0x20,
                          (sensorStatus & 0x40) === 0x40 ];
  let isContactDetected = [ (sensorStatus & 0x01) !== 0x01 ];
  let isMotionDetected = [ (sensorStatus & 0x02) === 0x02 ];

  return { batteryPercentage: batteryPercentage,
           isButtonPressed: isButtonPressed,
           isContactDetected: isContactDetected,
           isMotionDetected: isMotionDetected,
           txCount: txCount, uri: MINEW_URI };
}


/**
 * Process Minew S3 data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processS3(data) {
  let frameVersion = data.readUInt8(FRAME_VERSION_OFFSET);

  if((frameVersion === 1) &&      // Static information frame
     (data.length === S3_STATIC_FRAME_LENGTH)) {
    let firmwareVersion = data.readUInt8(FIRMWARE_VERSION_OFFSET) + '.' +
                          data.readUInt8(FIRMWARE_VERSION_OFFSET + 1) + '.' +
                          data.readUInt8(FIRMWARE_VERSION_OFFSET + 2);
    let hardwareVersion = data.readUInt16BE(HARDWARE_VERSION_OFFSET);
    let macSignature = toMacSignature(data, S3_STATIC_MAC_OFFSET);

    return {
        deviceIds: [ macSignature ],
        uri: MINEW_URI,
        version: firmwareVersion
    };
  }
  else if((frameVersion === 3) && // Temperature humidity frame
     (data.length === S3_TEMPERATURE_HUMIDITY_FRAME_LENGTH)) {

    let batteryPercentage = data.readUInt8(BATTERY_PERCENTAGE_OFFSET);
    let temperature = utils.parseSigned88(data.subarray(S3_TEMPERATURE_OFFSET));
    let relativeHumidity =
                         utils.parseSigned88(data.subarray(S3_HUMIDITY_OFFSET));
    let macSignature = toMacSignature(data, S3_TEMPERATURE_HUMIDITY_MAC_OFFSET);

    return {
        batteryPercentage: batteryPercentage,
        deviceIds: [ macSignature ],
        relativeHumidity: relativeHumidity,
        temperature: temperature,
        uri: MINEW_URI
    };
  }

  return null;
}


/**
 * Process Minew S4 data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
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
 * Process Minew Connect V3 data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processConnectV3(data) {
  let frameVersion = data.readUInt8(FRAME_VERSION_OFFSET);

  switch(frameVersion) {
    case 0x00:
      return processConnectV3Type00(data);
    case 0x03:
      return processConnectV3Type03(data);
    case 0x05:
      return processConnectV3Type05(data);
    case 0x18:
      return processConnectV3Type18(data);
    case 0x1b:
      return processConnectV3Type1b(data);
  }

  return null;
}


/**
 * Process Minew Connect V3 type 0x00 device information frame data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processConnectV3Type00(data) {
  if(data.length !== V3_00_FRAME_LENGTH) {
    return null;
  }

  let macSignature = toMacSignature(data, V3_00_MAC_OFFSET);
  let batteryPercentage = data.readUInt8(V3_00_BATTERY_PERCENTAGE_OFFSET);
  let firmwareVersionBinary = data.readUInt16BE(V3_00_FIRMWARE_VERSION_OFFSET);
  let firmwareVersion = ((firmwareVersionBinary >> 13) & 0x0003) + '.' +
                        ((firmwareVersionBinary >> 7) & 0x003f) + '.' +
                        (firmwareVersionBinary & 0x007f);

  return {
      batteryPercentage: batteryPercentage,
      deviceIds: [ macSignature ],
      uri: MINEW_URI,
      version: firmwareVersion
  };
}


/**
 * Process Minew Connect V3 type 0x03 combination frame data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processConnectV3Type03(data) {
  if(data.length < V3_03_MIN_FRAME_LENGTH) {
    return null;
  }

  let sensorData = { uri: MINEW_URI };
  let currentBlockOffset = V3_SUBFRAME_VERSION_OFFSET;

  while(currentBlockOffset < (data.length - V3_03_POST_BLOCK_LENGTH)) {
    let currentBlockId = data.readUInt8(currentBlockOffset);

    if(V3_BLOCKS.has(currentBlockId)) {
      let currentBlockParameters = V3_BLOCKS.get(currentBlockId);
      let currentBlockLength = currentBlockParameters.length;
      let currentBlock = data.subarray(currentBlockOffset + 1,
                                       currentBlockOffset + currentBlockLength);
      let blockData = currentBlockParameters.process(currentBlock);

      Object.assign(sensorData, blockData);
      currentBlockOffset += currentBlockLength;
    }
    else {
      return sensorData;
    }
  }

  return sensorData;
}


/**
 * Process Minew Connect V3 type 0x05 temperature/humidity frame data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processConnectV3Type05(data) {
  if(data.length !== V3_05_FRAME_LENGTH) {
    return null;
  }

  let subframeVersion = data.readUInt8(V3_SUBFRAME_VERSION_OFFSET);
  let deviceInfo = data.readUInt8(V3_05_DEVICE_INFO_OFFSET);
  let temperature =
                   utils.parseSigned88(data.subarray(V3_05_TEMPERATURE_OFFSET));
  let relativeHumidity =
                      utils.parseSigned88(data.subarray(V3_05_HUMIDITY_OFFSET));
  let name = data.toString('utf8', V3_05_NAME_OFFSET, V3_05_NAME_OFFSET +
                           V3_05_NAME_LENGTH).replace(/\0/g, '');
  let sensorData = {
      name: name,
      temperature: temperature,
      uri: MINEW_URI
  };

  if(!(deviceInfo & V3_05_DEVICE_INFO_TEMPERATURE_ONLY_MASK)) {
    sensorData.relativeHumidity = relativeHumidity;
  }
  if(subframeVersion > 0) {
    let isMarked = (data.readUInt8(V3_05_MARK_OFFSET) === 0x01);
    sensorData.isMarked = [ isMarked ];
  }

  return sensorData;
}


/**
 * Process Minew Connect V3 type 18 radar monitor frame data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processConnectV3Type18(data) {
  if(data.length !== V3_18_FRAME_LENGTH) {
    return null;
  }

  let subframeVersion = data.readUInt8(V3_SUBFRAME_VERSION_OFFSET);
  let sensorData = { uri: MINEW_URI };

  if(subframeVersion === 0x00) {      // Human traffic monitoring
    let serialNumber = data.readUInt8(V3_18_SERIAL_NUMBER_OFFSET);
    let numberOfEntries = data.readUInt16LE(V3_18_NUMBER_OF_ENTRIES_OFFSET);
    let numberOfExits = data.readUInt16LE(V3_18_NUMBER_OF_EXITS_OFFSET);
    sensorData.passageCounts = [ numberOfEntries, numberOfExits ];
    sensorData.passageCountsCycle = serialNumber;
  }
  else if(subframeVersion === 0x01) { // Person coordinate info
    let serialNumber = data.readUInt8(V3_18_SERIAL_NUMBER_OFFSET);
    let statusByte = data.readUInt8(V3_18_NUMBER_OF_PEOPLE_OFFSET);
    let packetIndex = statusByte & 0x30;
    sensorData.numberOfOccupants = statusByte & 0x0f;
    sensorData.numberOfOccupantsCycle = serialNumber;
    // TODO: nearest?
  }
  else {
    return null;
  }

  return sensorData;
}


/**
 * Process Minew Connect V3 type 0x1b temperature frame data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processConnectV3Type1b(data) {
  if(data.length !== V3_1B_FRAME_LENGTH) {
    return null;
  }

  let isEncrypted = (data.readUInt8(V3_1B_SUBVERSION_OFFSET) &
                     V3_1B_ENCRYPTION_MASK) === V3_1B_ENCRYPTION_MASK;

  if(isEncrypted) {
    return {}; // TODO: extract data for decryption
  }

  let productId = data.readUInt16BE(V3_1B_PRODUCT_ID_OFFSET);
  let macSignature = toMacSignature(data, V3_1B_STATIC_MAC_OFFSET);
  let batteryVoltage = data.readUInt16BE(V3_1B_BATTERY_VOLTAGE_OFFSET) / 1000;
  let temperature =
                   utils.parseSigned88(data.subarray(V3_1B_TEMPERATURE_OFFSET));
  let txPower = data.readInt8(V3_1B_TX_POWER_OFFSET);
  let uri = V3_PRODUCT_URIS.has(productId) ? V3_PRODUCT_URIS.get(productId) :
                                             MINEW_URI;

  let sensorData = {
      batteryVoltage: batteryVoltage,
      temperature: temperature,
      txPower: txPower,
      deviceIds: [ macSignature ],
      uri: uri
  };

  return sensorData;
}


/**
 * Process Minew Connect V3 block type 0x03 acceleration data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processV3Block03(data) {
  return {
    acceleration: [
      utils.parseSigned88(data.subarray(0, 2)),
      utils.parseSigned88(data.subarray(2, 4)),
      utils.parseSigned88(data.subarray(4, 6))
    ]
  };
}


/**
 * Process Minew Connect V3 block type 0x21 battery data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processV3Block21(data) {
  return { batteryPercentage: data.readUInt8() };
}


/**
 * Process Minew Connect V3 block type 0x22 tamper data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processV3Block22(data) {
  let isTriggered = (data.readUInt8() > 0);
  return { isContactDetected: [ !isTriggered ] };
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
