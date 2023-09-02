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

   /**
 * Une route  recuperer  les volumes non valide d'un chef plateau
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/plateau/nonvalide
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/plateau/nonvalide', scanning_volumeRetour_controller.findAllVolumePlateauChefNonValide)

    /**
 * Une route  recuperer  les volumes non valide chez chef plateau retourner vers agent superviseur
 *@method GET
 * @url /scanning/retour/agent/volume/plateau/retour/nonvalide
 */
 scanning_volumeRetour_routes.get('/agent/volume/plateau/retour/nonvalide', scanning_volumeRetour_controller.findAllVolumePlateauChefNonValideRetour)

   /**
* Une route pour recuperer les pvs d'un chef plateau signe avec un agent superviseur
*@method POST
* @url /scanning/retour/agent/equipe/pvs/retour/nonVilid
*/
scanning_volumeRetour_routes.post('/agent/equipe/pvs/retour/nonVilid', scanning_volumeRetour_controller.findGetsPvsAgentSupervieurRetourNonValid)

   /**
* Une route pour recuperer les volumes retour d'un agents superviseur ailles scanning
*@method GET
* @url /scanning/retour/agent/allVolume/supAilleScanning
*/
scanning_volumeRetour_routes.get('/agent/allVolume/supAillescanning', scanning_volumeRetour_controller.findVolumeAssocierAgentsupAilleScan)

 /**
 * Une route pour archives les volumes retournez d'un agent sup ailles
 *@method PUT
 * @url /scanning/retour/agent/supaille/chefEquipeScan
 */
 scanning_volumeRetour_routes.put('/agent/supaille/chefEquipeScan', scanning_volumeRetour_controller.retourAgentSupAile)

    /**
 * Une route  permet de recuperer les folios reourner pour se faire scanner
 *@method GET
 * @url /scanning/retour/agent/foliosRecus/retours
 */
 scanning_volumeRetour_routes.get('/agent/foliosRecus/retours', scanning_volumeRetour_controller.getFoliosAllRetourner)

 
    /**
 * Une route  permet de recuperer les folios reourner pour se faire scanner
 *@method GET
 * @url /scanning/retour/agent/foliosRecus/retours/notValid
 */
 scanning_volumeRetour_routes.get('/agent/foliosRecus/retours/notValid', scanning_volumeRetour_controller.getFoliosAllRetournernotValid)


     /**
 * Une route  permet de recuperer les details de volumes
 *@method GET
 * @url /scanning/retour/agent/details/volume
 */
 scanning_volumeRetour_routes.get('/agent/details/volume/:ID_VOLUME', scanning_volumeRetour_controller.getVolumeDetailsVolume)

      /**
 * Une route  permet de recuperer les details de volumes traite par un agents sup ailles scanning
 *@method GET
 * @url /scanning/retour/agent/details/traites
 */
 scanning_volumeRetour_routes.get('/agent/details/traites/:ID_VOLUME', scanning_volumeRetour_controller.getVolumeDetailsVolumeTraitesSup)

       /**
 * Une route  permet de recuperer les details de volumes chez le chef equipe
 *@method GET
 * @url /scanning/retour/agent/details/chefEquiScan
 */
 scanning_volumeRetour_routes.get('/agent/details/chefEquiScan/:ID_VOLUME', scanning_volumeRetour_controller.getVolumeDetailsVolumeTraitesChefEquiScan)

        /**
 * Une route  permet de recuperer les details de volumes pret a etre archiver
 *@method GET
 * @url /scanning/retour/agent/details/pretArchives
 */
 scanning_volumeRetour_routes.get('/agent/details/pretArchives/:ID_VOLUME', scanning_volumeRetour_controller.getVolumeDetailsVolumeTraitesPretArchives)

        /**
 * Une route  permet de recuperer les details de volumes non scanner et non valid
 *@method GET
 * @url /scanning/retour/agent/details/nonScan/nonValid
 */
 scanning_volumeRetour_routes.get('/agent/details/nonScan/nonValid/:ID_VOLUME', scanning_volumeRetour_controller.getVolumeDetailsVolumeNonScanNonValid)

         /**
 * Une route  permet de recuperer les malles disponible 
 *@method GET
 * @url /scanning/retour/agent/details/males
 */
 scanning_volumeRetour_routes.get('/agent/details/males', scanning_volumeRetour_controller.getMalesDisponible)

  /**
* Une route pour recuperer la liste des agents superviseurs scanning
*@method GET
* @url /scanning/retour/agent/supeAille/scanning
*/
scanning_volumeRetour_routes.get('/agent/supeAille/scanning', scanning_volumeRetour_controller.findAgentAllSupAgentScanning)


 /**
 * Une route pour reenvoyez le volumes dans la phase scanning
 *@method PUT
 * @url /scanning/retour/agent/scanningPhase/updtae
 */
 scanning_volumeRetour_routes.put('/agent/scanningPhase/updtae', scanning_volumeRetour_controller.retourAgentSupAileReenvoyezScan)


module.exports = scanning_volumeRetour_routes