const lodash = require('lodash');
const { Room } = require('../models/_Room');
const { User } = require('../models/_User');
const { House } = require('../models/_House');
const { mongoose } = require('mongoose');
const { slug } = require('../utils');
const moment = require('moment');

this.findRooms = async function(criteria, more) {
  const queryObj = {
    isDeleted: false
  };
  // Build query
  // User Id
  const userId = lodash.get(criteria, "userId");
  if(mongoose.Types.ObjectId.isValid(userId)) {
    lodash.set(queryObj, "userId", new mongoose.Types.ObjectId(userId));
  }
  // House Id
  const houseId = lodash.get(criteria, "houseId");
  if(mongoose.Types.ObjectId.isValid(houseId)) {
    lodash.set(queryObj, "houseId", new mongoose.Types.ObjectId(houseId));
  }
  // House ids
  const houseIds = lodash.get(criteria, "houseIds");
  if(lodash.isArray(houseIds)) {
    lodash.set(queryObj, "houseId", { $in: houseIds });
  }
  // Price
  // Search: slug
  let searchInfo = lodash.get(criteria, "search");
  if(searchInfo) {
    searchInfo = slug(searchInfo);
    lodash.set(queryObj, "$or", [
      { "slug": { "$regex": searchInfo } },
    ])
  }
  // isAds
  const isAds = lodash.get(criteria, "isAds");
  if(lodash.isBoolean(isAds)) {
    lodash.set(queryObj, "isAds", isAds);
  }
  //
  const rooms = await Room.find(queryObj)
  .sort([['name', 1]]);
  //
  for (let i = 0; i < rooms.length; i++) {
    rooms[i] = await this.wrapExtraToRoom(rooms[i].toJSON(), more);
  }
  // pagination
  const DEFAULT_LIMIT = 6;
  const page = lodash.get(criteria, "page") || 1;
  const _start = DEFAULT_LIMIT * (page -1);
  const _end = DEFAULT_LIMIT * page;
  const paginatedRooms = lodash.slice(rooms, _start, _end);
  //
  const output = {
    count: rooms.length,
    page: page,
    rows: paginatedRooms,
  }
  return output;
}

this.getRoom = async function (roomId, more) {
  const rooms = await Room.findById(roomId);
  //
  if (!rooms) {
    throw new Error(`Not found rooms with id [${roomId}]!`);
  }
  //
  return this.wrapExtraToRoom(rooms.toJSON(), more);
};

this.wrapExtraToRoom = async function(roomObj, more) {
  // id
  roomObj.id = lodash.get(roomObj, "_id").toString();
  // userInfo
  if (roomObj.userId) {
    roomObj.user = await User.findById(roomObj.userId, "fullName");
  }
  // houseInfo
  roomObj.house = await House.findById(roomObj.houseId, ["name", "address", "description", "image"]);
  // price
  roomObj.price = roomObj.price.toLocaleString('vi-VI');
  //
  return lodash.omit(roomObj, ["_id"]);
};

this.createRoom = async function (roomObj, more) {
  const room = new Room(roomObj);
  await room.save();
  //
  return room;
}

this.updateRoom = async function (roomId, roomObj, more) {
  const room = await Room.findByIdAndUpdate(roomId, roomObj, { new: true, runValidators: true });
  //
  if (!room) {
    throw new Error(`Not found room with id [${roomId}]!`);
  }
  //
  await room.save();
  //
  return room;
}

this.deleteRoom = async function(roomId, more) {
  const room = await Room.findByIdAndUpdate(roomId, {
    isDeleted: true
  }, { new: true });
  //
  if (!room) {
    throw new Error(`Not found room with id [${roomId}]!`);
  }
  //
  return room;
};

this.removeRoom = async function(roomId, more) {
  const room = await Room.findByIdAndRemove(roomId);
  //
  if (!room) {
    throw new Error(`Not found room with id [${roomId}]!`);
  }
  //
  return room;
};
//
module.exports = this