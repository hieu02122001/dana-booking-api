const lodash = require('lodash');
const { User } = require('../models/_User');
const jwt = require('jsonwebtoken');
const { mongoose } = require('mongoose');
const { slug } = require('../utils');
const moment = require('moment');

this.findUsers = async function(criteria, more) {
  const queryObj = {
    isDeleted: false
  };
  // Build query
  // Role
  const role = lodash.get(criteria, "role");
  if(role) {
    lodash.set(queryObj, "role", role);
  }
  // House Id
  const houseId = lodash.get(criteria, "houseId");
  if(mongoose.Types.ObjectId.isValid(houseId)) {
    lodash.set(queryObj, "houseId", mongoose.Types.ObjectId(houseId));
  }
  // Room Id
  const roomId = lodash.get(criteria, "roomId");
  if(mongoose.Types.ObjectId.isValid(roomId)) {
    lodash.set(queryObj, "roomId", mongoose.Types.ObjectId(roomId));
  }
  // Search: slug/phone/email
  let searchInfo = lodash.get(criteria, "search");
  if(searchInfo) {
    searchInfo = slug(searchInfo);
    lodash.set(queryObj, "$or", [
      { "slug": { "$regex": searchInfo } },
      { "phone": { "$regex": searchInfo } },
      { "email": { "$regex": searchInfo } },
    ])
  }
  //
  const users = await User.find(queryObj)
  .sort([['createdAt', -1]]);
  //
  for (let i = 0; i < users.length; i++) {
    users[i] = await this.wrapExtraToUser(users[i].toJSON(), more);
  }
  // pagination
  const DEFAULT_LIMIT = 6;
  const page = lodash.get(criteria, "page") || 1;
  const _start = DEFAULT_LIMIT * (page -1);
  const _end = DEFAULT_LIMIT * page;
  const paginatedUsers = lodash.slice(users, _start, _end);
  //
  const output = {
    count: users.length,
    page: page,
    rows: paginatedUsers,
  }
  return output;
}

this.getUser = async function (userId, more) {
  const user = await User.findById(userId);
  //
  if (!user) {
    throw new Error(`Not found user with id [${userId}]!`);
  }
  //
  return this.wrapExtraToUser(user.toJSON(), more);
};

this.wrapExtraToUser = async function(userObj, more) {
  // id
  userObj.id = lodash.get(userObj, "_id").toString();
  //
  return lodash.omit(userObj, ["_id", "password"]);
};

this.createUser = async function (userObj, more) {
  const user = new User(userObj);
  await user.save();
  //
  return user;
}

this.updateUser = async function (userId, userObj, more) {
  const passwordChange = lodash.get(userObj, "password");
  lodash.unset(userObj, "password");
  const user = await User.findByIdAndUpdate(userId, userObj, { new: true, runValidators: true });
  //
  if (!user) {
    throw new Error(`Not found user with id [${userId}]!`);
  }
  if (passwordChange) {
    user.password = passwordChange;
    await user.save();
  }
  //
  return user;
}

this.deleteUser = async function(userId, more) {
  const user = await User.findByIdAndUpdate(userId, {
    isDeleted: true
  }, { new: true });
  //
  if (!user) {
    throw new Error(`Not found user with id [${userId}]!`);
  }
  //
  return user;
};

this.removeUser = async function(userId, more) {
  const user = await User.findOneAndRemove(userId);
  //
  if (!user) {
    throw new Error(`Not found user with id [${userId}]!`);
  }
  //
  return user;
};
//
module.exports = this