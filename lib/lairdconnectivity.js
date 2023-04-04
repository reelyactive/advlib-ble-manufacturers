/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 24;
const PROTOCOL_1M_PHY_ADVERTISEMENT = 0x0001;
const ADV_1M_PHY_LENGTH_BYTES = 24;
const NETWORK_ID_OFFSET = 2;
const FLAGS_OFFSET = 4;
const BLUETOOTH_ADDRESS_OFFSET = 6;
const RECORD_TYPE_OFFSET = 12;
const RECORD_NUMBER_OFFSET = 13;
const EPOCH_OFFSET = 15;
const RECORD_DATA_OFFSET = 19;
const RECORD_DATA_LENGTH_BYTES = 4;
const LAIRD_CONNECTIVITY_URI = "https://sniffypedia.org/Organization/Laird_Connectivity/";
const PA_PER_PSI = 6894.757;
const IDENTIFIER_TYPE_RND_48 = 3;


/**
 * Process Laird Connectivity manufacturer-specific data.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed Laird Connectivity data as JSON.
 */
function process(data) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_DATA_LENGTH_BYTES)) {
    return null;
  }

  let protocolId = buf.readUInt16LE();

  switch(protocolId) {
    case PROTOCOL_1M_PHY_ADVERTISEMENT:
      return process1MPhyAdvertisement(buf);
    default:
      return null;
  }
}


/**
 * Process 1M PHY Advertisement frame data.
 * @param {Buffer} data The manufacturer data as a Buffer.
 * @return {Object} The processed Laird Connectivity data as JSON.
 */
function process1MPhyAdvertisement(data) {
  if(data.length !== ADV_1M_PHY_LENGTH_BYTES) {
    return null;
  }
console.log(data);
  let lairdSensor = { uri: LAIRD_CONNECTIVITY_URI };
  let advASignature = toAdvASignature(data, BLUETOOTH_ADDRESS_OFFSET);
  let recordType = data.readUInt8(RECORD_TYPE_OFFSET);
  let recordData = data.subarray(RECORD_DATA_OFFSET, RECORD_DATA_OFFSET +
                                                     RECORD_DATA_LENGTH_BYTES);

  lairdSensor.networkId = data.readUInt16LE(NETWORK_ID_OFFSET);
  lairdSensor.flags = data.readUInt16LE(FLAGS_OFFSET);
  lairdSensor.deviceIds = [ advASignature ];
  lairdSensor.recordNumber = data.readUInt16LE(RECORD_NUMBER_OFFSET);
  lairdSensor.timestamp = data.readUInt32LE(EPOCH_OFFSET);

  Object.assign(lairdSensor, processRecord(recordType, recordData));

  return lairdSensor;
}


/**
 * Process record based on the given record type and data.
 * @param {Number} type The type of record.
 * @param {Buffer} data The raw record data to process.
 * @return {Object} The processed measurement data as JSON.
 */
function processRecord(type, data) {
  switch(type) {
    case 1:  // Temperature
    case 4:  // Alarm high temp 1
    case 5:  // Alarm high temp 2
    case 6:  // Alarm high temp clear
    case 7:  // Alarm low temp 1
    case 8:  // Alarm low temp 2
    case 9:  // Alarm low temp clear
    case 10: // Alarm delta temp
      return { temperature: data.readInt32LE() / 100 }; // TODO: validate
    case 2:  // Magnet
      return { isContactDetected: [ (data.readUInt32LE() === 0) ] };
    case 3:  // Movement
      return { isMotionDetected: [ true ] };
    case 12: // Battery Good
    case 13: // Advertise on button
    case 16: // Battery Bad
      return { batteryVoltage: data.readUInt32LE() / 1000 };
    case 17: // Reset
      return;
    case 18: // Thermistor 1
    case 19: // Thermistor 2
    case 20: // Thermistor 3
    case 21: // Thermistor 4
      return { temperature: data.readFloatLE() };
    case 22: // Analog voltage 1
    case 23: // Analog voltage 2
    case 24: // Analog voltage 3
    case 25: // Analog voltage 4
      return; // TODO
    case 26: // Analog current 1
    case 27: // Analog current 2
    case 28: // Analog current 3
    case 29: // Analog current 4
      return; // TODO
    case 30: // Ultrasonic distance
      return; // TODO
    case 31: // Pressure 1
    case 32: // Pressure 2
      return { pressure: data.readFloatLE() * PA_PER_PSI };
    case 33: // Temperature alarm
    case 34: // Analog alarm
    case 35: // Digital alarm
    case 36: // Epoch
    case 37: // Reset reason
    case 38: // Tamper
      return; // TODO
  }
}


/**
 * Convert the given 48-bit data into an advertiser address signature.
 * @param {Buffer} data The buffer containing the little-endian address.
 * @param {Integer} index The index to the start of the advertiser address.
 * @return {String} The advertiser address signature.
 */
function toAdvASignature(data, index) {
  return data.toString('hex', index + 5, index + 6) +
         data.toString('hex', index + 4, index + 5) +
         data.toString('hex', index + 3, index + 4) +
         data.toString('hex', index + 2, index + 3) +
         data.toString('hex', index + 1, index + 2) +
         data.toString('hex', index + 0, index + 1) +         
         '/' + IDENTIFIER_TYPE_RND_48;
}


module.exports.process = process;
