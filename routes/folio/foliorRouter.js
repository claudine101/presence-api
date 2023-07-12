const express = require('express')
const folio_routes=require('./folio.routes')
const folioRouter=express.Router()
folioRouter.use('/dossiers',folio_routes)
module.exports = folioRouter

