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
 *  Une route pour recupere Agents superviseur archives
 *@method GET
 * @url /preparation/batiment/agentArchive
 */
 preparation_batiment_routes.get('/agentArchive', preparation_batiment_controller.findAgentArchive)



module.exports = preparation_batiment_routes
