const express = require('express')
const folio_controller = require('../../../controllers/administration/folio/folio.controller')
const folio_routes = express.Router()

/**
 * Une route pour afficher le details du folio
 *@method GET
 * @url /folio/all_folio/id_folio
 */
 folio_routes.get('/:ID_FOLIO', folio_controller.findOneFolio)

module.exports = folio_routes