const express = require('express')
const folio_routes=require('./folio.routes')
const folio_all_route=express.Router()

folio_all_route.use('/folio',folio_routes)
module.exports = folio_all_route

