const express = require('express')
const scanning_volume_controller = require('../../controllers/scanning/scanning_volume.controller')
const scanning_volume_routes = express.Router()

/**
 * Une route pour donner le volume et le malle chez une agent superviseur aille phase scanning
 *@method PUT
 * @url /scanning/volume
 */
scanning_volume_routes.put('/:ID_VOLUME', scanning_volume_controller.volumeScanning)

/**
* Une route pour envoyer le volumes chef un agent de plateau
*@method PUT
* @url /scanning/volume/aile
*/
scanning_volume_routes.put('/aile/:ID_VOLUME', scanning_volume_controller.volumeAileScanning)

/**
* Une route pour envoyer les folios du chef plateau vers un agent superviseur scanning
*@method PUT
* @url /scanning/volume/folio/plateau
*/
scanning_volume_routes.put('/folio/plateau', scanning_volume_controller.folioChefScanning)

/**
* Une route pour envoyer les folios d'un agent superviseur scanning vers equipe scanning
*@method PUT
* @url /scanning/volume/folio/equipe
*/
scanning_volume_routes.put('/folio/equipe', scanning_volume_controller.folioSupScanning)

/**
 * Une route  recuperer  les volumes d'un chef d'equipe archives aille
 *@method GET
 * @url /scanning/volume
 */
 scanning_volume_routes.get('/', scanning_volume_controller.findAll)

 /**
 * Une route  recuperer  la listes des agent superviseur aille avec leurs volumes
 *@method GET
 * @url /scanning/volume/sup/aille
 */
 scanning_volume_routes.get('/sup/aille', scanning_volume_controller.findAllSuperviseur)

 /**
* Une route pour valide qu'un agent superviseur aille donne a un chef equipe
*@method PUT
* @url /scanning/volume/chefEquipe
*/
scanning_volume_routes.put('/chefEquipe/:ID_VOLUME', scanning_volume_controller.chefEquipeValide)

 /**
* Une route pour recuperer les agents superviseur aille scanning
*@method GET
* @url /scanning/volume/agentSupAille
*/
scanning_volume_routes.get('/agentSupAille', scanning_volume_controller.findAgentSupAilleScanning)

 /**
* Une route pour recuperer le maille dans laquelle contient le volume
*@method GET
* @url /scanning/volume/maille
*/
scanning_volume_routes.get('/maille/:ID_VOLUME', scanning_volume_controller.findAllMaille)

module.exports = scanning_volume_routes