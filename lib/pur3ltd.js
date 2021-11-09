/**
 * Copyright reelyActive 2021
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 2; // {}
const PUR3_LTD_URI = "https://sniffypedia.org/Organization/Pur3_Ltd/";


/**
 * Process Pur3 Ltd (Espruino) manufacturer-specific data.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed data as JSON.
 */
function process(data) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_DATA_LENGTH_BYTES)) {
    return null;
  }

  // Assume that the manufacturer-specific data is JSON as per Pur3 Ltd's
  // recommendation: https://www.espruino.com/Reference#l_NRF_setAdvertising
  try {
    let json = JSON.parse(buf.toString('utf8', 0));
    json.uri = PUR3_LTD_URI;

    return json;

  }
  catch {
    return { uri: PUR3_LTD_URI };
  }
}


module.exports.process = process;