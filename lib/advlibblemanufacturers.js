/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


const apple = require('./apple');
const codeBlueCommunications = require('./codebluecommunications');
const enocean = require('./enocean');
const utils = require('./utils');


/**
 * Process Bluetooth Low Energy advertising manufacturer-specific data.
 * @param {Integer} companyCode The Bluetooth-assigned company code.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed manufacturer-specific data as JSON.
 */
function processManufacturerSpecificData(companyCode, data) {
  let buf = utils.convertToBuffer(data);
  let isValidCompanyCode = (Number.isInteger(companyCode) && (companyCode > 0));

  if(!isValidCompanyCode || (buf === null)) {
    return null;
  }

  switch(companyCode) {
    case 0x004c:
      return apple.process(data);
    case 0x03da:
      return enocean.process(data);
    case 0x0583:
      return codeBlueCommunications.process(data);
  }

  return null;
}


module.exports.processManufacturerSpecificData = processManufacturerSpecificData;