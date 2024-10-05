/**
 * Copyright reelyActive 2021-2024
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 1;
const S3_STATIC_FRAME_LENGTH = 20;
const S3_TEMPERATURE_HUMIDITY_FRAME_LENGTH = 16;
const S4_STATIC_FRAME_LENGTH = 18;
const S4_DOOR_ALARM_FRAME_LENGTH = 15;
const V3_STATIC_FRAME_LENGTH = 24;
const V3_TEMPERATURE_HUMIDITY_FRAME_LENGTH = 24;
const V3_RADAR_MONITOR_FRAME_LENGTH = 24;
const V3_TEMPERATURE_FRAME_LENGTH = 24;
const FRAME_VERSION_OFFSET = 1;
const SUBFRAME_VERSION_OFFSET = 2;
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
const V3_STATIC_MAC_OFFSET = 2;
const V3_DEVICE_INFO_OFFSET = 3;
const V3_BATTERY_PERCENTAGE_OFFSET = 8;
const V3_FIRMWARE_VERSION_OFFSET = 9;
const V3_TEMPERATURE_OFFSET = 5;
const V3_HUMIDITY_OFFSET = 7;
const V3_HT_NAME_OFFSET = 9;
const V3_MARK_OFFSET = 17;
const V3_SERIAL_NUMBER_OFFSET = 3;
const V3_NUMBER_OF_ENTRIES_OFFSET = 4;
const V3_NUMBER_OF_EXITS_OFFSET = 6;
const V3_NUMBER_OF_PEOPLE_OFFSET = 4;
const V3_1B_BATTERY_VOLTAGE_OFFSET = 12;
const V3_1B_TEMPERATURE_OFFSET = 14;
const V3_NAME_LENGTH = 8;
const V3_DEVICE_INFO_TEMPERATURE_ONLY_MASK = 0x02;
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
      return processConnectV3Static(data);
    case 0x05:
      return processConnectV3TemperatureHumidity(data);
    case 0x18:
      return processConnectV3RadarMonitor(data);
    case 0x1b:
      return processConnectV3Temperature(data);
  }

  return null;
}


/**
 * Process Minew Connect V3 static frame data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processConnectV3Static(data) {
  if(data.length !== V3_STATIC_FRAME_LENGTH) {
    return null;
  }

  let macSignature = toMacSignature(data, V3_STATIC_MAC_OFFSET);
  let batteryPercentage = data.readUInt8(V3_BATTERY_PERCENTAGE_OFFSET);
  let firmwareVersionBinary = data.readUInt16BE(V3_FIRMWARE_VERSION_OFFSET);
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
 * Process Minew Connect V3 temperature/humidity frame data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processConnectV3TemperatureHumidity(data) {
  if(data.length !== V3_TEMPERATURE_HUMIDITY_FRAME_LENGTH) {
    return null;
  }

  let subframeVersion = data.readUInt8(SUBFRAME_VERSION_OFFSET);
  let deviceInfo = data.readUInt8(V3_DEVICE_INFO_OFFSET);
  let temperature = utils.parseSigned88(data.subarray(V3_TEMPERATURE_OFFSET));
  let relativeHumidity =
                       utils.parseSigned88(data.subarray(V3_HUMIDITY_OFFSET));
  let name = data.toString('utf8', V3_HT_NAME_OFFSET, V3_HT_NAME_OFFSET +
                           V3_NAME_LENGTH).replace(/\0/g, '');
  let sensorData = {
      name: name,
      temperature: temperature,
      uri: MINEW_URI
  };

  if(!(deviceInfo & V3_DEVICE_INFO_TEMPERATURE_ONLY_MASK)) {
    sensorData.relativeHumidity = relativeHumidity;
  }
  if(subframeVersion > 0) {
    let isMarked = (data.readUInt8(V3_MARK_OFFSET) === 0x01);
    sensorData.isMarked = [ isMarked ];
  }

  return sensorData;
}


/**
 * Process Minew Connect V3 radar monitor frame data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processConnectV3RadarMonitor(data) {
  if(data.length !== V3_RADAR_MONITOR_FRAME_LENGTH) {
    return null;
  }

  let subframeVersion = data.readUInt8(SUBFRAME_VERSION_OFFSET);
  let sensorData = { uri: MINEW_URI };

  if(subframeVersion === 0x00) {      // Human traffic monitoring
    let serialNumber = data.readUInt8(V3_SERIAL_NUMBER_OFFSET);
    let numberOfEntries = data.readUInt16LE(V3_NUMBER_OF_ENTRIES_OFFSET);
    let numberOfExits = data.readUInt16LE(V3_NUMBER_OF_EXITS_OFFSET);
    sensorData.passageCounts = [ numberOfEntries, numberOfExits ];
    sensorData.passageCountsCycle = serialNumber;
  }
  else if(subframeVersion === 0x01) { // Person coordinate info
    let serialNumber = data.readUInt8(V3_SERIAL_NUMBER_OFFSET);
    let statusByte = data.readUInt8(V3_NUMBER_OF_PEOPLE_OFFSET);
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
 * Process Minew Connect V3 temperature frame data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed beacon data as JSON.
 */
function processConnectV3Temperature(data) {
  if(data.length !== V3_TEMPERATURE_FRAME_LENGTH) {
    return null;
  }

  // TODO: handle encryption and additional properties
  let batteryVoltage = data.readUInt16BE(V3_1B_BATTERY_VOLTAGE_OFFSET) / 1000;
  let temperature = utils.parseSigned88(data.subarray(V3_1B_TEMPERATURE_OFFSET));

  let sensorData = {
      batteryVoltage: batteryVoltage,
      temperature: temperature,
      uri: MINEW_URI
  };

  return sensorData;
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
