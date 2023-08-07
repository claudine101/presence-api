const express = require('express')
const folio_controller = require('../../controllers/administration/folio/folio.controller')
const foliocontroller= require('../../controllers/administration/folio_administration.controller');
const folio_routes = express.Router()

/**
 * Une route pour afficher le details du folio
 *@method GET
 * @url /folio/all_folio/id_folio
 */
 folio_routes.get('/:ID_FOLIO', folio_controller.findOneFolio)

 /**
 * Une route pour afficher les agents qui ont traites un folio
 *@method GET
 * @url /folio/all_folio/userByFolio/id_folio
 */
 folio_routes.get('/userByFolio/:ID_FOLIO', folio_controller.findUsersByFolio)


  /**
 * Une route pour afficher l'historique du folio
 *@method GET
 * @url /folio/all_folio/id_folio
 */
 folio_routes.get('/traitant/:ID_FOLIO', folio_controller.findTraitantFolio)
 folio_routes.get("/",foliocontroller.findAll);

module.exports = folio_routes