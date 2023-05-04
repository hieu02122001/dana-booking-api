const express = require('express');
const lodash = require('lodash');
const router = new express.Router();

const UserManager = require('../services/UserManager');
//
const { PATH } = require('../utils');
//
router.get(PATH + '/users', async (req, res) => {
  const { query } = req;
  try {
    const result = await UserManager.findUsers(query);
    //
    res.send(result);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});
//
router.get(PATH + '/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserManager.getUser(id);
    //
    res.send(user);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});
//
router.post(PATH + '/users', async (req, res) => {
  const { body } = req;
  try {
    const result = await UserManager.createUser(body)
    //
    res.send(result);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});
//
router.put(PATH + '/users/:id', async (req, res) => {
  const { body, params } = req;
  //
  try {
    const user = await UserManager.updateUser(params.id, body);
    //
    res.send(user);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});
//
router.delete(PATH + '/users/:id', async (req, res) => {
  const { id } = req.params;
  //
  try {
    const user = await UserManager.deleteUser(id);
    //
    res.send(user);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});
// ADMIN

// LANDLORD

// CLIENT
module.exports = router;