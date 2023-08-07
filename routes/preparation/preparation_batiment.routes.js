const express = require('express')
const preparation_batiment_controller = require('../../controllers/preparation/preparation_batiment_controller')
const preparation_batiment_routes = express.Router()

/**
 * Une route  permet recuperer  les batiments
 *@method GET
 * @url /preparation/batiment
 */
 preparation_batiment_routes.get('/', preparation_batiment_controller.findAll)

 /**
 * Une route  permet recuperer  les mailles
 *@method GET
 * @url /preparation/batiment/mailles
 */
 preparation_batiment_routes.get('/mailles', preparation_batiment_controller.findMailles)


 /**
 * Une route  permet  recupere les ailes d'un batiment
 *@method GET
 * @url /preparation/batiment/aile
 */
 preparation_batiment_routes.get('/aile/:ID_BATIMENT', preparation_batiment_controller.findAile)

  /**
 * Une route  permet  recupere les agent  distributeur par  aile
 *@method GET
 * @url /preparation/batiment/distributeur
 */
 preparation_batiment_routes.get('/distributeur/:ID_AILE', preparation_batiment_controller.findDistributeur)

  /**
 * Une route  permet  recupere les agent  superviseur par  aile
 *@method GET
 * @url /preparation/batiment/superviseurAile
 */
 preparation_batiment_routes.get('/superviseurAile', preparation_batiment_controller.findAgentSuperviseurAile)

/**
 * Une route  permet  recupere les agent  superviseur phase preparation
 *@method GET
 * @url /preparation/batiment/superviseurPreparation
 */
 preparation_batiment_routes.get('/superviseurPreparation', preparation_batiment_controller.findAgentSuperviseurPreparation)

 /**
 * Une route  permet  recupere les agent  preparation
 *@method GET
 * @url /preparation/batiment/agentPreparation
 */
 preparation_batiment_routes.get('/agentPreparation', preparation_batiment_controller.findAgentPreparation)



  /**
 * Une route  permet  recupere les chef plateau
 *@method GET
 * @url /preparation/batiment/chefPlateau
 */
 preparation_batiment_routes.get('/chefPlateau', preparation_batiment_controller.findChefPlateau)


  /**
 *  Une route pour recupere Agents superviseur archives
 *@method GET
 * @url /preparation/batiment/agentArchive
 */
 preparation_batiment_routes.get('/agentArchive', preparation_batiment_controller.findAgentArchive)


 /**
 * Une route  permet recuperer  les provinces
 *@method GET
 * @url /preparation/batiment/provinces
 */
 preparation_batiment_routes.get('/provinces', preparation_batiment_controller.findProvinces)

 /**
 * Une route  permet recuperer   les communes par  rapport au provinces selectionner
 *@method GET
 * @url /preparation/batiment/communes
 */
 preparation_batiment_routes.get('/communes/:PROVINCE_ID', preparation_batiment_controller.findCommunes)

 /**
 * Une route  permet recuperer   les zones par  rapport au commune selectionner
 *@method GET
 * @url /preparation/batiment/zones
 */
 preparation_batiment_routes.get('/zones/:COMMUNE_ID', preparation_batiment_controller.findZones)

 /**
 * Une route  permet recuperer  les collines par  rapport au zone selectionner
 *@method GET
 * @url /preparation/batiment/collines
 */
 preparation_batiment_routes.get('/collines/:ZONE_ID', preparation_batiment_controller.findCollines)



module.exports = preparation_batiment_routes
