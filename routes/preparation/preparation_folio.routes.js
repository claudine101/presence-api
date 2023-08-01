const express = require('express')
const preparation_folio_controller = require('../../controllers/preparation/preparation_folio_controller')
const preparation_folio_routes = express.Router()

/**
 * Une route  permet  un chef  de divisions des archives d'ajouter   les folios 
 *@method POST
 * @url /preparation/folio
 */
 preparation_folio_routes.post('/', preparation_folio_controller.createfolio)

module.exports = preparation_folio_routes
