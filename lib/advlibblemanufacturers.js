/**
 * Copyright reelyActive 2015-2023
 * We believe in an open Internet of Things
 */


const apple = require('./apple');
const codeBlueCommunications = require('./codebluecommunications');
const efento = require('./efento');
const enocean = require('./enocean');
const lairdConnectivity = require('./lairdconnectivity');
const minew = require('./minew');
const mokotechnology = require('./mokotechnology');
const pur3ltd = require('./pur3ltd');
const utils = require('./utils');
const wiliot = require('./wiliot');


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
    case 0x0077:
      return lairdConnectivity.process(data);
    case 0x026c:
      return efento.process(data);
    case 0x03da:
      return enocean.process(data);
    case 0x0500:
      return wiliot.process(data);
    case 0x0583:
      return codeBlueCommunications.process(data);
    case 0x0590:
      return pur3ltd.process(data);
    case 0x0639:
      return minew.process(data);
    case 0x0a62:
      return mokotechnology.process(data);
  }

  return null;
}


module.exports.processManufacturerSpecificData = processManufacturerSpecificData;
