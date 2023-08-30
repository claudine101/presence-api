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
* Une route pour retourner le valumes qui attends le pv de retours chez un agent superviseur archives
*@method GET
* @url /scanning/retour/agent/allVolume/archives
*/
scanning_volumeRetour_routes.get('/agent/allVolume/archives', scanning_volumeRetour_controller.findAllVolumerRetourAgentSupeArchives)

/**
* Une route pour afficher les volumes retpurner chez un agent desarchivages
*@method GET
* @url /scanning/retour/agent/allVolume/desarchivages
*/
scanning_volumeRetour_routes.get('/agent/allVolume/desarchivages', scanning_volumeRetour_controller.findAllVolumerRetourDesarchivages)

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

  /**
* Une route pour recuperer les pvs d'agent superviseur signe avec equipe
*@method POST
* @url /scanning/retour/agent/equipe/pvs
*/
scanning_volumeRetour_routes.post('/agent/equipe/pvs', scanning_volumeRetour_controller.findGetsPvsAgentSupervieur)

  /**
 * Une route  permet  si le chef plateau est pret a signer le pv de retours un agent superviseur  
 *@method GET
 * @url /scanning/retour/agent/retour/pvs
 */
 scanning_volumeRetour_routes.get('/agent/retour/pvs/:USERS_ID', scanning_volumeRetour_controller.checkRetourChefPlateau)

   /**
 * Une route  permet  si agent superviseur scanning est pret a signer le pv de retours une equipe scanning
 *@method GET
 * @url /scanning/retour/agent/retour/equipeScanning
 */
 scanning_volumeRetour_routes.get('/agent/retour/equipeScanning/:USERS_ID', scanning_volumeRetour_controller.checkRetourAgentSupScann)

   /**
 * Une route  permet de recuperer les folios d'un agents superviseur 
 *@method GET
 * @url /scanning/retour/agent/foliosRecus
 */
 scanning_volumeRetour_routes.get('/agent/foliosRecus', scanning_volumeRetour_controller.getFoliosAll)

 /**
 * Une route pour faire le retour entre un agent superviseur et le chef plateau
 *@method PUT
 * @url /scanning/retour/agent/retour/plateau
 */
 scanning_volumeRetour_routes.put('/agent/retour/plateau', scanning_volumeRetour_controller.updateRetourPlateauSup)

 /**
 * Une route  recuperer  les volumes retourner d'un chef plateau
 *@method GET
 * @url /scanning/retour/agent/volume/plateau
 */
 scanning_volumeRetour_routes.get('/agent/volume/plateau', scanning_volumeRetour_controller.findAllVolumePlateauChef)

  /**
 * Une route  recuperer  les volumes deja traitees d'un chef plateau
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/plateau
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/plateau', scanning_volumeRetour_controller.findAllVolumePlateauChefTraites)

   /**
* Une route pour recuperer les pvs de retour de chef plateau signe avec agent superviseur
*@method POST
* @url /scanning/retour/agent/chefPlateau/retour/pvs
*/
scanning_volumeRetour_routes.post('/agent/chefPlateau/retour/pvs', scanning_volumeRetour_controller.findGetsPvsChefPlateauRetour)

  /**
 * Une route  recuperer  les volumes deja traitees d'un agent superviseur aile scanning
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/supaillescanning
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/supaillescanning', scanning_volumeRetour_controller.findAllVolumeSupAileScanningTraites)

   /**
* Une route pour recuperer les pvs de retour d'un agent superviseur aille signe avec chef plateau
*@method POST
* @url /scanning/retour/agent/supAille/retour/pvs
*/
scanning_volumeRetour_routes.post('/agent/supAille/retour/pvs', scanning_volumeRetour_controller.findGetsPvsSupAilleScanRetour)

  /**
 * Une route  recuperer  les volumes deja traitees un chef d'equipe scannings
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/chefEquiScanning
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/chefEquiScanning', scanning_volumeRetour_controller.findAllVolumeChefEquipScanningTraites)

   /**
 * Une route  recuperer  les volumes deja traitees un agent distributeur
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/agentDistributeur
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/agentDistributeur', scanning_volumeRetour_controller.findAllVolumeAgentDistributeurTraites)

    /**
 * Une route  recuperer  les volumes deja traitees un agent superviseur archives
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/agentSupArchives
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/agentSupArchives', scanning_volumeRetour_controller.findAllVolumeAgenSupArchivesTraites)

 /**
 * Une route pour archives les volumes retournez chez un agent de desarchivages
 *@method PUT
 * @url /scanning/retour/agent/desarchivages/archivevol
 */
 scanning_volumeRetour_routes.put('/agent/desarchivages/archivevol/:ID_VOLUME', scanning_volumeRetour_controller.volumeArchivesAgentDesarchivages)

     /**
 * Une route  recuperer  les volumes deja archives par un agent desarchivages
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/agentDesarchivages
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/agentDesarchivages', scanning_volumeRetour_controller.findAllVolumeAgenDesarchivagesTraites)

     /**
 * Une route  recuperer  les volumes deja traitees un chef d'equipe preparations
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/chefequipepreparation
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/chefequipepreparation', scanning_volumeRetour_controller.findAllVolumeChefEquipePrepqrqtionTraites)

module.exports = scanning_volumeRetour_routes