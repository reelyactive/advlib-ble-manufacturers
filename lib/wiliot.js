/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const DATA_LENGTH_BYTES = 27;
const WILIOT_COMPANY_CODE_RAW = '0005';
const WILIOT_URI = "https://sniffypedia.org/Organization/Wiliot_Ltd/";


/**
 * Process Wiliot manufacturer-specific data.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed data as JSON.
 */
function process(data) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length !== DATA_LENGTH_BYTES)) {
    return null;
  }

  let payload = WILIOT_COMPANY_CODE_RAW + buf.toString('hex');

  return {
      relay: { type: "wiliot", payload: payload },
      uri: WILIOT_URI
  };
}


module.exports.process = process;
