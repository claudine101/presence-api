const express = require('express')
const upload_folio_routes = require('./upload_folio.routes')
const upload_folio_contoller = require('../../controllers/uploadEDMS/upload_folio.controller')

const uploadRouter = express.Router()

uploadRouter.use("/folio", upload_folio_routes)
// uploadRouter.get("/flashs", upload_folio_contoller.getFlashs)

module.exports = uploadRouter