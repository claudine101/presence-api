const express = require("express")
const indexation_folio_contoller = require("../../../controllers/indexation/indexation_folio.controller")

const indexation_folio_routes = express.Router()

indexation_folio_routes.get("/etapes_folio/:ID_ETAPE_FOLIO", indexation_folio_contoller.getFolioByEtapes)

module.exports = indexation_folio_routes