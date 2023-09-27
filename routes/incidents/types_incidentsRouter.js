const express = require('express')
const types_incidents_routes=require('./types_incidents.routes')
const types_incidentsRouter=express.Router()

types_incidentsRouter.use('/incident',types_incidents_routes)
module.exports = types_incidentsRouter

