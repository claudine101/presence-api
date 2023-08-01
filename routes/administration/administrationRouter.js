const express = require('express');


const volume_routes= require('./volume_administration.routes')
const folio_routes= require('./folio_administration.routes')


const administrationRouter=express.Router();

administrationRouter.use('/volume',volume_routes)
administrationRouter.use('/folio',folio_routes)
module.exports = administrationRouter