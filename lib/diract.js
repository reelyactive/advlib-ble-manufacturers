/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


const utils = require('./utils');


const MIN_DATA_LENGTH_BYTES = 1;
const VALID_PROXIMITY_FRAME_LENGTHS = [ 9, 14, 19, 24 ];
const VALID_DIGEST_FRAME_LENGTHS = [ 9, 14, 19, 24 ];
const INSTANCE_LENGTH = 4;
const PROXIMITY_FRAME_LENGTH_OFFSET = 1;
const PROXIMITY_FRAME_LENGTH_MASK = 0x1f;
const PROXIMITY_FRAME_COUNT_OFFSET = 1;
const PROXIMITY_FRAME_COUNT_SHIFT = 5;
const PROXIMITY_INSTANCE_OFFSET = 2;
const PROXIMITY_SENSORS_OFFSET = 6;
const PROXIMITY_SENSORS_LENGTH = 3;
const PROXIMITY_SENSORS_MASK = 0x3f;
const PROXIMITY_NEAREST_OFFSET = 9;
const PROXIMITY_NEAREST_LENGTH = 5;
const PROXIMITY_MAX_NEAREST = 3;
const PROXIMITY_RSSI_MASK = 0x3f;
const PROXIMITY_RSSI_OFFSET = -92;
const DIGEST_FRAME_LENGTH_OFFSET = 1;
const DIGEST_FRAME_LENGTH_MASK = 0x1f;
const DIGEST_PAGE_OFFSET = 1;
const DIGEST_PAGE_SHIFT = 5;
const DIGEST_INSTANCE_OFFSET = 2;
const DIGEST_SUMMARY_OFFSET = 6;
const DIGEST_SUMMARY_LENGTH = 3;
const DIGEST_LAST_PAGE_FLAG = 0x800000;
const DIGEST_TIMESTAMP_MASK = 0x7fffff;
const DIGEST_INTERACTIONS_OFFSET = 9;
const DIGEST_INTERACTIONS_LENGTH = 5;
const DIGEST_MAX_INTERACTIONS_PER_PAGE = 3;



/**
 * Process DirAct data.
 * @param {Object} data The manufacturer data as a hexadecimal-string or Buffer.
 * @return {Object} The processed DirAct data as JSON.
 */
function process(data) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_DATA_LENGTH_BYTES)) {
    return null;
  }

  let frameType = buf.readUInt8();
  switch(frameType) {
    case 0x01: // DirAct proximity
      return processProximity(buf);
    case 0x11: // DirAct digest
      return processDigest(buf);
  }

  return null;
}


/**
 * Process DirAct proximity data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed proximity data as JSON.
 */
function processProximity(data) {
  let isInvalidLength = (!VALID_PROXIMITY_FRAME_LENGTHS.includes(data.length));
  if(isInvalidLength) {
    return null;
  }

  let frameLength = data.readUInt8(PROXIMITY_FRAME_LENGTH_OFFSET) & 
                                                    PROXIMITY_FRAME_LENGTH_MASK;
  let cyclicCount = data.readUInt8(PROXIMITY_FRAME_COUNT_OFFSET) >> 
                                                    PROXIMITY_FRAME_COUNT_SHIFT;
  let instanceId = data.toString('hex', PROXIMITY_INSTANCE_OFFSET,
                                 PROXIMITY_INSTANCE_OFFSET + INSTANCE_LENGTH);
  let sensors = data.readUIntBE(PROXIMITY_SENSORS_OFFSET,
                                PROXIMITY_SENSORS_LENGTH);
  let acceleration = [
      toAcceleration((sensors >> 18) & PROXIMITY_SENSORS_MASK),
      toAcceleration((sensors >> 12) & PROXIMITY_SENSORS_MASK),
      toAcceleration((sensors >> 6) & PROXIMITY_SENSORS_MASK)
  ];
  let batteryPercentage = Math.round(100 * (sensors & PROXIMITY_SENSORS_MASK)
                                                                          / 63);
  let nearest = [];

  for(let cNearest = 0; cNearest < PROXIMITY_MAX_NEAREST; cNearest++) {
    let nearestOffset = PROXIMITY_NEAREST_OFFSET +
                        (cNearest * PROXIMITY_NEAREST_LENGTH);
    if(nearestOffset < (frameLength + 2)) {
      let instanceId = data.toString('hex', nearestOffset,
                                     nearestOffset + INSTANCE_LENGTH);
      let rssi = (data.readUInt8(nearestOffset + INSTANCE_LENGTH) & 
                                 PROXIMITY_RSSI_MASK) + PROXIMITY_RSSI_OFFSET;
      nearest.push({ deviceId: instanceId, rssi: rssi });
    }
  }

  let proximity = {
      deviceIds: [ instanceId ],
      batteryPercentage: batteryPercentage,
      nearest: nearest,
      uri: "https://sniffypedia.org/Organization/Code_Blue_Communications_Inc/DirAct/"
  };

  if(!acceleration.includes(null)) {
    proximity.acceleration = acceleration;
  }

  return proximity; 
}


/**
 * Process DirAct digest data.
 * @param {Object} data The raw manufacturer data as a Buffer.
 * @return {Object} The processed digest data as JSON.
 */
function processDigest(data) {
  let isInvalidLength = (!VALID_DIGEST_FRAME_LENGTHS.includes(data.length));
  if(isInvalidLength) {
    return null;
  }

  let frameLength = data.readUInt8(DIGEST_FRAME_LENGTH_OFFSET) & 
                                                       DIGEST_FRAME_LENGTH_MASK;
  let pageIndex = data.readUInt8(DIGEST_PAGE_OFFSET) >>  DIGEST_PAGE_SHIFT;
  let instanceId = data.toString('hex', DIGEST_INSTANCE_OFFSET,
                                 DIGEST_INSTANCE_OFFSET + INSTANCE_LENGTH);
  let summary = data.readUIntBE(DIGEST_SUMMARY_OFFSET, DIGEST_SUMMARY_LENGTH);
  let isLastPage = ((summary & DIGEST_LAST_PAGE_FLAG) !== 0);
  let timestamp = summary & DIGEST_TIMESTAMP_MASK;
  let pagedInteractionOffset = pageIndex * DIGEST_MAX_INTERACTIONS_PER_PAGE;
  let interactions = Array(pagedInteractionOffset).fill(null);
  let interactionDigest = { timestamp: timestamp, interactions: interactions };

  for(let cInteraction = 0; cInteraction < DIGEST_MAX_INTERACTIONS_PER_PAGE;
      cInteraction++) {
    let interactionOffset = DIGEST_INTERACTIONS_OFFSET +
                           (cInteraction * DIGEST_INTERACTIONS_LENGTH);
    if(interactionOffset < (frameLength + 2)) {
      let instanceId = data.toString('hex', interactionOffset,
                                     interactionOffset + INSTANCE_LENGTH);
      let count = toInteractionCount(data.readUInt8(interactionOffset +
                                                              INSTANCE_LENGTH));
      interactions.push({ deviceId: instanceId, count: count });
    }
  }

  return {
      deviceIds: [ instanceId ],
      interactionDigest: interactionDigest,
      uri: "https://sniffypedia.org/Organization/Code_Blue_Communications_Inc/DirAct/"
  };
}


/**
 * Convert the given 6-bit data into an acceleration reading.
 * @param {Integer} data The raw 6-bit acceleration data.
 * @return {Number} The processed acceleration value.
 */
function toAcceleration(data) {
  if(data === 0x20) {
    return null;
  }
  if(data > 0x20) {
    return (data - 64) / 16;
  }
  return data / 16;
}


/**
 * Convert the given 8-bit data into an interaction count.
 * @param {Integer} data The raw 8-bit interaction count.
 * @return {Integer} The processed interaction count value.
 */
function toInteractionCount(data) {
  if(data > 0x80) {
    return (data & 0x7f) << 8;
  }

  return data;
}


module.exports.process = process;