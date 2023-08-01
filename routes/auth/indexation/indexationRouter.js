const express = require('express')
const indexation_folio_routes = require('./indexation_folio.routes')

const indexationRouter = express.Router()

indexationRouter.use("/folio", indexation_folio_routes)

module.exports = indexationRouter