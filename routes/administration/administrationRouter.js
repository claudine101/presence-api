const express = require('express');


const volume_routes= require('./volume_administration.routes')


const administrationRouter=express.Router();

administrationRouter.use('/volume',volume_routes)

module.exports = administrationRouter