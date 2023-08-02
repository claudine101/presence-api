const express = require('express');
const volumecontroller= require('../../controllers/administration/volume_adminstration.controller');
const volumeroutes= express.Router()

volumeroutes.get("/",volumecontroller.findAll);
volumeroutes.get("/:id",volumecontroller.gethistoriquevol);

module.exports=volumeroutes
