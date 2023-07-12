const express = require('express')
const folio_controller = require('../../controllers/folio/folio.controller')
const folio_routes = express.Router()
/**
 * Une route  recuperer  les folios d'un chef  de divisions des archives
 *@method GET
 * @url /folio/dossiers/folio
 */
folio_routes.get('/folio', folio_controller.findById)
/**
 * Une route  recuperer  tous les folios
 *@method GET
 * @url /folio/dossiers/folios
 */
 folio_routes.get('/folios', folio_controller.findAll)

 /**
 * Une route  recuperer  tous les nature du  folios
 *@method GET
 * @url /folio/dossiers/nature
 */
 folio_routes.get('/nature', folio_controller.findNature)

  /**
 * Une route  recuperer  tous les maille 
 *@method GET
 * @url /folio/dossiers/maille
 */
 folio_routes.get('/maille', folio_controller.findMaille)

  /**
 * Une route  recuperer  tous les batiments
 *@method GET
 * @url /folio/dossiers/batiment
 */
 folio_routes.get('/batiment', folio_controller.findBatiment)

 /**
 * Une route  recuperer  tous les ailes
 *@method GET
 * @url /folio/dossiers/aile
 */
 folio_routes.get('/aile/:ID_BATIMENT', folio_controller.findAile)

 /**
 * Une route  recuperer  tous les agents de distribution par  aile
 *@method GET
 * @url /folio/dossiers/aile
 */
 folio_routes.get('/agent/:ID_AILE', folio_controller.findAgentDistributeurAile)


 /**
 * Une route  permet  un chef  de divisions des archives d'ajouter   les folios 
 *@method POST
 * @url /folio/dossiers
 */
folio_routes.post('/', folio_controller.createFalio)

module.exports = folio_routes