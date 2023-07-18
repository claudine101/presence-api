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
 * Une route  recuperer  tous les folios d'un  volume
 *@method GET
 * @url /folio/dossiers/allFolio
 */
 folio_routes.get('/allFolio/:ID_VOLUME', folio_controller.findAlls)

 /**
 * Une route  recuperer  nbre  les folios d'un agent  superviseur  phase preparation
 *@method GET
 * @url /folio/dossiers/nbreFolio
 */
 folio_routes.get('/nbreFolio', folio_controller.findNbre)

 /**
 * Une route  recuperer   les folios d'un agent  superviseur  phase preparation
 *@method GET
 * @url /folio/dossiers/getFolio
 */
 folio_routes.get('/getFolio', folio_controller.findAllFolio)



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
 * @url /folio/dossiers/agent
 */
 folio_routes.get('/agent/:ID_AILE', folio_controller.findAgentDistributeurAile)
 /**
 * Une route  recuperer  tous les agents superviseur aile par  aile
 *@method GET
 * @url /folio/dossiers/agentSuperviseur
 */
 folio_routes.get('/agentSuperviseur', folio_controller.findAgentSuperviseur)

  /**
 * Une route  recuperer  tous les chef plateau phase preparation par  aile
 *@method GET
 * @url /folio/dossiers/chefPlateau
 */
 folio_routes.get('/chefPlateau', folio_controller.findChefPlateau)

 /**
 * Une route  recuperer  tous les agents superviseur phase preparation  par  aile
 *@method GET
 * @url /folio/dossiers/agentSuperviseurPreparation
 */
 folio_routes.get('/agentSuperviseurPreparation', folio_controller.findAgentPreparation)

  /**
 * Une route  recuperer  tous les agents preparation  par  aile
 *@method GET
 * @url /folio/dossiers/agentPreparation
 */
 folio_routes.get('/agentPreparation', folio_controller.findAgentsPreparation)



 /**
 * Une route  permet  un chef  de divisions des archives d'ajouter   les folios 
 *@method POST
 * @url /folio
 */
folio_routes.post('/', folio_controller.createFalio)

/**
 * Une route  permet  a un chef de plateau  de donner 
 *  les folio   a un agent superviseur  phase preparation
 *@method PUT
 * @url /folio/dossiers/superviser
 */
 folio_routes.put('/superviser', folio_controller.superviser)

 /**
 * Une route  permet  a un agent superviseur  de donner 
 *  les folio   a un agent preparation
 *@method PUT
 * @url /folio/dossiers/preparation
 */
 folio_routes.put('/preparation', folio_controller.preparation)

 /**
 * Une route  permet  retour d'agent preparation
 *@method PUT
 * @url /folio/dossiers/preparation
 */
 folio_routes.put('/RetourPreparation/:ID_USER_AILE_AGENT_PREPARATION', folio_controller.RetourPreparation)

 /**
 * Une route  permet  a un agent superviseur  de donner 
 *  les folio   a un agent preparation
 *@method PUT
 * @url /folio/dossiers/addDetails
 */
 folio_routes.put('/addDetails', folio_controller.addDetails)



module.exports = folio_routes