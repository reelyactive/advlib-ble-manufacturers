/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


const diract = require('./diract');
const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 1;


/**
 * Process Code Blue Communications manufacturer-specific data.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed Code Blue Communications data as JSON.
 */
function process(data) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_DATA_LENGTH_BYTES)) {
    return null;
  }

  let frameType = buf.readUInt8();
  switch(frameType) {
    case 0x01: // DirAct proximity
      return diract.process(buf);
    case 0x11: // DirAct digest
      return diract.process(buf);
  }

  return null;
}


module.exports.process = process;