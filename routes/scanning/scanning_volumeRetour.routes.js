const express = require('express')
const scanning_volumeRetour_controller = require('../../controllers/scanning/scanning_volumeRetour.controller')
const scanning_volumeRetour_routes = express.Router()

/**
* Une route pour faire signer les pv de retour entre un chef plaeau et un agent superviseur aille scanning
*@method PUT
* @url /scanning/retour/agent
*/
scanning_volumeRetour_routes.put('/agent/:ID_VOLUME', scanning_volumeRetour_controller.volumeScanningRetourAgentAille)

/**
* Une route pour faire signer les pv de retour entre un agent superviseur aille scanning et chef d'equipe
*@method GET
* @url /scanning/retour/agent/chefEquipe
*/
scanning_volumeRetour_routes.get('/agent/chefEquipe', scanning_volumeRetour_controller.volumeScanningRetourChefEquipe)

 /**
* Une route pour recuperer la liste des agents distributeurs
*@method GET
* @url /scanning/retour/agent/distributeur
*/
scanning_volumeRetour_routes.get('/agent/distributeur', scanning_volumeRetour_controller.findAgentDistributeur)

/**
* Une route pour faire signer les pv de retour entre un chef d'equipe scanning et agents distributeurs
*@method PUT
* @url /scanning/retour/agent/distributeur
*/
scanning_volumeRetour_routes.put('/agent/distributeur/:ID_VOLUME', scanning_volumeRetour_controller.volumeScanningRetourAgentDistributeur)

/**
* Une route pour faire signer les pv de retour entre un chef d'equipe scanning et agents distributeurs
*@method GET
* @url /scanning/retour/agent/allVolume
*/
scanning_volumeRetour_routes.get('/agent/allVolume', scanning_volumeRetour_controller.findAllVolumerRetourDistributeur)

 /**
* Une route pour recuperer la liste des agents distributeurs
*@method GET
* @url /scanning/retour/agent/superviseurArchives
*/
scanning_volumeRetour_routes.get('/agent/superviseurArchives', scanning_volumeRetour_controller.findAgentSuperviseurArchives)

/**
* Une route pour faire signer les pv de retour entre un chef d'equipe scanning et agents distributeurs
*@method PUT
* @url /scanning/retour/agent/archives
*/
scanning_volumeRetour_routes.put('/agent/archives/:ID_VOLUME', scanning_volumeRetour_controller.volumeScanningRetourAgentSupArchives)

 /**
* Une route pour recuperer la liste des agents distributeurs
*@method GET
* @url /scanning/retour/agent/desarchivages
*/
scanning_volumeRetour_routes.get('/agent/desarchivages', scanning_volumeRetour_controller.findAgentDesarchivages)

/**
* Une route pour faire signer les pv de retour entre un agent superviseur archivages et agent desarchivages
*@method PUT
* @url /scanning/retour/agent/desarchivages
*/
scanning_volumeRetour_routes.put('/agent/desarchivages/:ID_VOLUME', scanning_volumeRetour_controller.volumeScanningRetourDesarchivages)


/**
 * Une route pour donner le volume et le malle d'un agent superviseur aille et chef plateau
 *@method PUT
 * @url /scanning/retour/agent/chef
 */
 scanning_volumeRetour_routes.put('/agent/chef/:ID_VOLUME', scanning_volumeRetour_controller.volumeAileScanning)

  /**
* Une route pour recuperer la listes des volumes qu'un chef d'equipe preparation a envoyer dans la phase scanning
*@method GET
* @url /scanning/retour/agent/chefEquipe/envoyer
*/
scanning_volumeRetour_routes.get('/agent/chefEquipe/envoyer', scanning_volumeRetour_controller.findAllVolumerEnvoyerScanning)

  /**
* Une route pour recuperer les pvs qu'on a signe lors de chef plateau en allant
*@method POST
* @url /scanning/retour/agent/pvs
*/
scanning_volumeRetour_routes.post('/agent/pvs', scanning_volumeRetour_controller.findFoliosGetsPvsPlateau)

module.exports = scanning_volumeRetour_routes