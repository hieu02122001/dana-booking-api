const express = require('express');
const lodash = require('lodash');
const router = new express.Router();

const HouseManager = require('../services/HouseManager');
//
const { PATH } = require('../utils');
//
router.get(PATH + '/houses', async (req, res) => {
  const { query } = req;
  try {
    const result = await HouseManager.findHouses(query);
    //
    res.send(result);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});
//
router.get(PATH + '/houses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await HouseManager.getHouse(id);
    //
    res.send(result);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});
//
router.post(PATH + '/houses', async (req, res) => {
  const { body } = req;
  try {
    const result = await HouseManager.createHouse(body)
    //
    res.send(result);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});
//
router.put(PATH + '/houses/:id', async (req, res) => {
  const { body, params } = req;
  //
  try {
    const result = await HouseManager.updateHouse(params.id, body);
    //
    res.send(result);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});
//
router.delete(PATH + '/houses/:id', async (req, res) => {
  const { id } = req.params;
  //
  try {
    const result = await HouseManager.deleteHouse(id);
    //
    res.send(result);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

//
module.exports = router;