const express = require('express')
const folio_controller = require('../../controllers/administration/folio/folio.controller')
const foliocontroller= require('../../controllers/administration/folio_administration.controller');
const folio_routes = express.Router()

/**
 * Une route pour afficher le details du folio
 *@method GET
 * @url /admin/folio/id_folio
 */
 folio_routes.get('/:ID_FOLIO', folio_controller.findOneFolio)

 /**
 * Une route pour afficher les agents qui ont traites un folio
 *@method GET
 * @url /admin/folio/userByFolio/id_folio
 */
 folio_routes.get('/userByFolio/:ID_FOLIO', folio_controller.findUsersByFolio)

 /**
 * Une route pour afficher le timeline des etapes du dossier (Folio)
 *@method GET
 * @url /admin/folio/dossier_timeline/id_folio
 */
 folio_routes.get('/dossier_timeline/:ID_FOLIO', folio_controller.getEtapesDossier)
 
  /**
 * Une route pour afficher l'historique du folio
 *@method GET
 * @url /folio/all_folio/id_folio
 */
 folio_routes.get('/traitant/:ID_FOLIO', folio_controller.findTraitantFolio)
 folio_routes.get("/",foliocontroller.findAll);
 folio_routes.get("/folio/edrms",foliocontroller.finduploadedrms);

module.exports = folio_routes