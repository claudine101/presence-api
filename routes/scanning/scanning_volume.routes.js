const express = require('express')
const scanning_volume_controller = require('../../controllers/scanning/scanning_volume.controller')
const scanning_volume_routes = express.Router()

 /**
* Une route pour recuperer la liste des folios d'un agent superviseur scanning
*@method PUT
* @url /scanning/volume/retour/chef
*/
scanning_volume_routes.put('/retour/chef', scanning_volume_controller.updateRetourEquipe)



 /**
* Une route pour faire le retour entre un agent superviseur et le chef plateau
*@method PUT
* @url /scanning/volume
*/
scanning_volume_routes.put('/retour/plateau', scanning_volume_controller.updateRetourPlateauSup)


/**
 * Une route pour donner le volume et le malle chez une agent superviseur aille phase scanning
 *@method PUT
 * @url /scanning/volume
 */
scanning_volume_routes.put('/:ID_VOLUME', scanning_volume_controller.volumeScanning)

/**
 * Une route pour signer un pv chef plateau et agent superviseur aille
 *@method PUT
 * @url /scanning/volume/retour/aille
 */
 scanning_volume_routes.put('/retour/aille/:ID_VOLUME', scanning_volume_controller.volumeScanning)


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

 /**
* Une route pour recuperer la liste des chef plateau scanning
*@method GET
* @url /scanning/volume
*/
scanning_volume_routes.get('/plateau', scanning_volume_controller.findChefPlateau)

 /**
* Une route pour recuperer la liste des superviseur scanning
*@method GET
* @url /scanning/volume/superviseur
*/
scanning_volume_routes.get('/superviseur', scanning_volume_controller.findSuperviseurScanning)

 /**
* Une route pour recuperer la liste des equipe scanning
*@method GET
* @url /scanning/volume/allEquipe
*/
scanning_volume_routes.get('/allEquipe', scanning_volume_controller.findEquipeScanning)

/**
* Une route pour retourner les folios donnees a un agent de scanning
*@method GET
* @url /scanning/volume/equipeScanning
*/
scanning_volume_routes.get('/equipeScanning', scanning_volume_controller.findAllAgentsFolio)

/**
* Une route pour retourner les folios  pres a etre valide par un agent superviseur
*@method GET
* @url /scanning/volume/allFoliosScanning
*/
scanning_volume_routes.get('/allFoliosScanning', scanning_volume_controller.findAllFolioScannimg)

/**
 * Une route  recuperer  les volumes, folios et rencolier
 *@method GET
 * @url /scanning/volume/folios/details
 */
 scanning_volume_routes.get('/folios/details', scanning_volume_controller.findAllVolumeFolioRencolier)

 /**
 * Une route pour retour au chef plateau 
 *@method GET
 * @url /scanning/volume/retour/plateau
 */
 scanning_volume_routes.get('/retour/plateau', scanning_volume_controller.findAllVolumerRetour)

  /**
 * Une route pour retour au chef plateau vers agent superviseur aille
 *@method GET
 * @url /scanning/volume/retour/agent
 */
 scanning_volume_routes.get('/retour/agent', scanning_volume_controller.findAllVolumerSupAille)





module.exports = scanning_volume_routes