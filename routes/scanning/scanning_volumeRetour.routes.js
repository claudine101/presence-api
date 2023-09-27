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
 /**
 * Une route pour retourner les volumes reenvoyez chez un agent sup ailles scannings
 *@method GET
 * @url /scanning/retour/agent/reenvoyez/supailleScanning
 */
 scanning_volumeRetour_routes.get('/agent/reenvoyez/supailleScanning', scanning_volumeRetour_controller.renvoyezVoluSupAilleScanning)

 /**
 * Une route reenvoyer le volume et le malle d'un agent superviseur aille et chef plateau
 *@method PUT
 * @url /scanning/retour/agent/reenvoyez/chefPlateau
 */
 scanning_volumeRetour_routes.put('/agent/reenvoyez/chefPlateau/:ID_VOLUME', scanning_volumeRetour_controller.volumeChefPlateauReenvoyez)

  /**
 * Une route pour retourner les volumes reenvoyez qui attend le retour chez un agent sup ailles scannings
 *@method GET
 * @url /scanning/retour/agent/reenvoyez/supailleScanning/retour
 */
 scanning_volumeRetour_routes.get('/agent/reenvoyez/supailleScanning/retour', scanning_volumeRetour_controller.renvoyezVoluSupAilleScanningRetour)

  /**
 * Une route reenvoyer le folios du chef plateau vers un agents superviseurs
 *@method PUT
 * @url /scanning/retour/agent/reenvoyez/folios/superviseur
 */
 scanning_volumeRetour_routes.put('/agent/reenvoyez/folios/superviseur', scanning_volumeRetour_controller.folioChefScanningReenvoyez)

  /**
 * Une route pour retourner les volumes reenvoyez chez un chef plateau
 *@method PUT
 * @url /scanning/retour/agent/reenvoyez/supailleScanning/plateau
 */
 scanning_volumeRetour_routes.put('/agent/reenvoyez/supailleScanning/plateau', scanning_volumeRetour_controller.folioEquipeScanningReenvoyer)

   /**
 * Une route pour retourner les folios reenvoyez deja traites par equipe
 *@method GET
 * @url /scanning/retour/agent/reenvoyez/equipe/retour
 */
 scanning_volumeRetour_routes.get('/agent/reenvoyez/equipe/retour', scanning_volumeRetour_controller.findAllAgentsFolioRetour)

   /**
* Une route pour recuperer les pvs d'agent superviseur signe avec equipe reenvoyer
*@method POST
* @url /scanning/retour/agent/equipe/pvs/reenvoyez
*/
scanning_volumeRetour_routes.post('/agent/equipe/pvs/reenvoyez', scanning_volumeRetour_controller.findGetsPvsAgentSupervieurReenvoyer)

 /**
 * Une route pour faire le retour entre un agent superviseur et equipe folios reenvoyez
 *@method PUT
 * @url /scanning/retour/agent/retour/equipe/superviseur
 */
 scanning_volumeRetour_routes.put('/agent/retour/equipe/superviseur', scanning_volumeRetour_controller.updateRetourEquipeFolioReenvoyez)

    /**
 * Une route pour retourner les folios reenvoyez deja reconcilier
 *@method GET
 * @url /scanning/retour/agent/reenvoyez/equipe/retour/bien/reconcilier
 */
 scanning_volumeRetour_routes.get('/agent/reenvoyez/equipe/retour/bien/reconcilier', scanning_volumeRetour_controller.findAllFolioScannimgReconciliers)

   /**
 * Une route pour retourner les volumes reenvoyez qui attend le retour chez un agent sup ailles scannings
 *@method GET
 * @url /scanning/retour/agent/reenvoyez/supailleScanning/retour/chefPlateau/bien
 */
 scanning_volumeRetour_routes.get('/agent/reenvoyez/supailleScanning/retour/chefPlateau/bien', scanning_volumeRetour_controller.findAllVolumerRetourReconcilierPret)

   /**
* Une route pour recuperer les pvs qu'on a signe lors de chef plateau en allant
*@method POST
* @url /scanning/retour/agent/pvs/reenvoyer/retour
*/
scanning_volumeRetour_routes.post('/agent/pvs/reenvoyer/retour', scanning_volumeRetour_controller.findFoliosGetsPvsPlateauReenvoyez)

  /**
 * Une route  permet  si le chef plateau est pret a signer le pv de retours un agent superviseur  
 *@method GET
 * @url /scanning/retour/agent/retour/check/action
 */
 scanning_volumeRetour_routes.get('/agent/retour/check/action/:USERS_ID', scanning_volumeRetour_controller.checkRetourChefPlateauCkeckReenvoyez)

 /**
 * Une route pour faire le retour entre un agent superviseur et le chef plateau
 *@method PUT
 * @url /scanning/retour/agent/retour/plateau/renvoyer/isvalid
 */
 scanning_volumeRetour_routes.put('/agent/retour/plateau/renvoyer/isvalid', scanning_volumeRetour_controller.updateRetourPlateauSupReenvoyezValid)

   /**
 * Une route  recuperer  les volumes deja traitees d'un chef plateau
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/plateau/reenvoyer/ok
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/plateau/reenvoyer/ok', scanning_volumeRetour_controller.findAllVolumePlateauChefTraitesReenvoyer)

    /**
* Une route pour recuperer les pvs de retour de chef plateau signe avec agent superviseur
*@method POST
* @url /scanning/retour/agent/chefPlateau/retour/pvs/original/retour
*/
scanning_volumeRetour_routes.post('/agent/chefPlateau/retour/pvs/original/retour', scanning_volumeRetour_controller.findGetsPvsChefPlateauRetourOriginal)

  /**
 * Une route pour retourner les volumes reenvoyez qui attend le retour chez un agent sup ailles scannings
 *@method GET
 * @url /scanning/retour/agent/reenvoyez/supailleScanning/retour/aileSupe/retour
 */
 scanning_volumeRetour_routes.get('/agent/reenvoyez/supailleScanning/retour/aileSupe/retour', scanning_volumeRetour_controller.findAllVolumerRetourReconcilierIsValid)

    /**
* Une route pour recuperer les pvs qu'on a signe par agent superviseur aille scanning en allant
*@method POST
* @url /scanning/retour/agent/pvs/reenvoyer/pvssss
*/
scanning_volumeRetour_routes.post('/agent/pvs/reenvoyer/pvssss', scanning_volumeRetour_controller.findFoliosGetsPvsPlateauReenvoyezPvsss)

 /**
 * Une route pour faire le retour entre le chef plateau et un agents superviseurs aille scanning
 *@method PUT
 * @url /scanning/retour/agent/retour/plateau/renvoyer/isvalid/bien/traitees
 */
 scanning_volumeRetour_routes.put('/agent/retour/plateau/renvoyer/isvalid/bien/traitees', scanning_volumeRetour_controller.updateRetourPlateauSupReenvoyezValidTraiteAille)

    /**
 * Une route  recuperer  les volumes deja traitees agent superviseur aille scanning
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/plateau/reenvoyer/aille/getVol
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/plateau/reenvoyer/aille/getVol', scanning_volumeRetour_controller.findAllVolumePlateauChefTraitesReenvoyerGetVolume)

     /**
* Une route pour recuperer les pvs de retour de chef plateau signe avec agent superviseur aile scanning
*@method POST
* @url /scanning/retour/agent/chefPlateau/retour/pvs/original/retour/Pvscscs
*/
scanning_volumeRetour_routes.post('/agent/chefPlateau/retour/pvs/original/retour/Pvscscs', scanning_volumeRetour_controller.findGetsPvsChefPlateauRetourOriginalAilleScann)

   /**
 * Une route pour retourner les volumes reenvoyez qui attend le retour chez le chef equipe scannings
 *@method GET
 * @url /scanning/retour/agent/reenvoyez/supailleScanning/retour/chefEquipe/bien
 */
 scanning_volumeRetour_routes.get('/agent/reenvoyez/supailleScanning/retour/chefEquipe/bien', scanning_volumeRetour_controller.findAllVolumerRetourReconcilierPretEquipeChef)

     /**
* Une route pour recuperer les pvs qu'on a signe par unc chef equipe scanning en allant
*@method POST
* @url /scanning/retour/agent/pvs/reenvoyer/chefEqui/pvssss
*/
scanning_volumeRetour_routes.post('/agent/pvs/reenvoyer/chefEqui/pvssss', scanning_volumeRetour_controller.findFoliosGetsPvsPlateauReenvoyezChefequipePvsss)

 /**
 * Une route pour faire le retour entre un agents superviseurs aille scanning et chef d'equipe
 *@method PUT
 * @url /scanning/retour/agent/retour/plateau/renvoyer/chefEquipe/bien/traitees
 */
 scanning_volumeRetour_routes.put('/agent/retour/plateau/renvoyer/chefEquipe/bien/traitees', scanning_volumeRetour_controller.updateRetourPlateauSupReenvoyezValidTraiteChefEquipe)

     /**
 * Une route  recuperer  les volumes deja traitees un chef d'equipe
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/plateau/reenvoyer/ChefEquipe/getVol
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/plateau/reenvoyer/ChefEquipe/getVol', scanning_volumeRetour_controller.findAllVolumePlateauChefTraitesReenvoyerGetVolumeChefEquipe)

      /**
* Une route pour recuperer les pvs de retour de chef plateau signe avec agent superviseur aile scanning
*@method POST
* @url /scanning/retour/agent/chefPlateau/retour/pvs/ChefEquipe/retour/Pvscscs
*/
scanning_volumeRetour_routes.post('/agent/chefPlateau/retour/pvs/ChefEquipe/retour/Pvscscs', scanning_volumeRetour_controller.findGetsPvsChefPlateauRetourOriginalEquipeScann)

       /**
 * Une route  permet de recuperer les details de volumes avec les folios valide
 *@method GET
 * @url /scanning/retour/agent/details/chefEquiScan/validFolios
 */
 scanning_volumeRetour_routes.get('/agent/details/chefEquiScan/validFolios/:ID_VOLUME', scanning_volumeRetour_controller.getVolumeDetailsVolumeTraitesChefEquiScanValidFolios)

     /**
* Une route pour recuperer les pvs qu'on a signe par agent superviseur aille scanning en allant
*@method POST
* @url /scanning/retour/agent/pvs/reenvoyer/pvssss/final
*/
scanning_volumeRetour_routes.post('/agent/pvs/reenvoyer/pvssss/final', scanning_volumeRetour_controller.findFoliosGetsPvsPlateauReenvoyezPvsssFinal)

 /**
 * Une route pour faire le retour entre le chef plateau et un agents superviseurs aille scanning
 *@method PUT
 * @url /scanning/retour/agent/retour/plateau/renvoyer/isvalid/retourChefequipescan
 */
 scanning_volumeRetour_routes.put('/agent/retour/plateau/renvoyer/isvalid/retourChefequipescan', scanning_volumeRetour_controller.updateRetourPlateauSupReenvoyezValidTraiteAilleFinal)

     /**
 * Une route  recuperer  les volumes deja traitees agent superviseur aille scanning
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/plateau/reenvoyer/aille/getVol/traitees
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/plateau/reenvoyer/aille/getVol/traitees', scanning_volumeRetour_controller.findAllVolumePlateauChefTraitesReenvoyerGetVolumeOriginal)

  /**
 * Une route pour faire le retour entre le chef  equipe et un agents distributeur
 *@method PUT
 * @url /scanning/retour/agent/retour/plateau/archivages/equi/distr
 */
 scanning_volumeRetour_routes.put('/agent/retour/plateau/archivages/equi/distr', scanning_volumeRetour_controller.updateRetourPlateauSupReenvoyezValidArchivagesDistr)

    /**
 * Une route pour retourner les volumes reenvoyez qui attend le retour chez un agent sup ailles scannings
 *@method GET
 * @url /scanning/retour/agent/reenvoyez/supailleScanning/retour/archivages/dist
 */
 scanning_volumeRetour_routes.get('/agent/reenvoyez/supailleScanning/retour/archivages/dist', scanning_volumeRetour_controller.findAllVolumerRetourReconcilierPretArchives)

      /**
* Une route pour recuperer les pvs qu'on a signe par agent superviseur aille scanning en allant
*@method POST
* @url /scanning/retour/agent/pvs/reenvoyer/archivages
*/
scanning_volumeRetour_routes.post('/agent/pvs/reenvoyer/archivages', scanning_volumeRetour_controller.findFoliosGetsPvsPlateauReenvoyezPvArchivages)

 /**
 * Une route pour faire le retour entre le chef  equipe et un agents archives
 *@method PUT
 * @url /scanning/retour/agent/retour/plateau/archivages/equi/archiv
 */
 scanning_volumeRetour_routes.put('/agent/retour/plateau/archivages/equi/archiv', scanning_volumeRetour_controller.updateRetourPlateauSupReenvoyezValidArchivagesArchiv)

      /**
 * Une route  recuperer  les volumes deja traitees agent distributeur
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/plateau/archivages/trait
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/plateau/archivages/trait', scanning_volumeRetour_controller.findAllVolumePlateauChefTraitesReenvoyerOri)

     /**
 * Une route pour retourner les volumes reenvoyez qui attend le retour chez un agent sup ailles scannings
 *@method GET
 * @url /scanning/retour/agent/reenvoyez/supailleScanning/retour/archivages/archives
 */
 scanning_volumeRetour_routes.get('/agent/reenvoyez/supailleScanning/retour/archivages/archives', scanning_volumeRetour_controller.findAllVolumerRetourReconcilierArchivv)

  /**
 * Une route pour faire le retour entre le chef  equipe et un agents desarchivages
 *@method PUT
 * @url /scanning/retour/agent/retour/plateau/archivages/equi/desarchivages
 */
 scanning_volumeRetour_routes.put('/agent/retour/plateau/archivages/equi/desarchivages', scanning_volumeRetour_controller.updateRetourPlateauSupReenvoyezValidArchivagesDesarchivages)

       /**
 * Une route  recuperer  les volumes deja traitees agent desarchivages
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/plateau/archivages/finArchives
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/plateau/archivages/finArchives', scanning_volumeRetour_controller.findAllVolumePlateauChefTraitesReenvoyerOriFinArchives)

      /**
 * Une route pour retourner les volumes reenvoyez qui attend le retour chez un agent sup ailles scannings
 *@method GET
 * @url /scanning/retour/agent/reenvoyez/supailleScanning/retour/archivages/archives/finito
 */
 scanning_volumeRetour_routes.get('/agent/reenvoyez/supailleScanning/retour/archivages/archives/finito', scanning_volumeRetour_controller.findAllVolumerRetourReconcilierArchivvFiniti)

  /**
 * Une route pour retourner les volumes reenvoyez desarchivages
 *@method PUT
 * @url /scanning/retour/agent/reenvoyez/supailleScanning/desarchivages/nice
 */
 scanning_volumeRetour_routes.put('/agent/reenvoyez/supailleScanning/desarchivages/nice', scanning_volumeRetour_controller.folioEquipeScanningReenvoyerNiceArchivees)

        /**
 * Une route  recuperer  les volumes deja traitees agent desarchivages
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/plateau/asrchgg
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/plateau/asrchgg', scanning_volumeRetour_controller.findAllVolumePlateauChefTraitesReenvoyerOriFinArchivesGGG)

        /**
 * Une route  recuperer  les volumes deja traitees agent desarchivages
 *@method GET
 * @url /scanning/retour/agent/volume/tousVolume
 */
 scanning_volumeRetour_routes.get('/agent/volume/tousVolume', scanning_volumeRetour_controller.findAllVolumeSupAilleScanningAllVolumeNice)

   /**
 * Une route  permet  si le chef plateau est pret a signer le pv de retours un agent superviseur  
 *@method GET
 * @url /scanning/retour/agent/retour/pvs/reenvoyez/chef
 */
 scanning_volumeRetour_routes.get('/agent/retour/pvs/reenvoyez/chef/:USERS_ID', scanning_volumeRetour_controller.checkRetourChefEquipeReenvoyezTraiteesReenvoyez)

    /**
 * Une route  permet  de verifier si on pret a faire le retour
 *@method GET
 * @url /scanning/retour/agent/retour/pvs/reenvoyez/supAille/chef
 */
 scanning_volumeRetour_routes.get('/agent/retour/pvs/reenvoyez/supAille/chef/:USERS_ID', scanning_volumeRetour_controller.checkRetourChefEquipeReenvoyezSupCheck)

       /**
* Une route pour recuperer les pvs qu'on a signe par agent superviseur aille scanning en allant
*@method POST
* @url /scanning/retour/agent/pvs/reenvoyer/archivages/pvs
*/
scanning_volumeRetour_routes.post('/agent/pvs/reenvoyer/archivages/pvs', scanning_volumeRetour_controller.findFoliosGetsPvsPlateauReenvoyezPvArchivagesPVS)

   /**
* Une route pour recuperer les pvs de retour de chef plateau signe avec agent superviseur
*@method POST
* @url /scanning/retour/agent/chefPlateau/retour/pvs/nonValid/plateau
*/
scanning_volumeRetour_routes.post('/agent/chefPlateau/retour/pvs/nonValid/plateau', scanning_volumeRetour_controller.findGetsPvsChefPlateauRetourNonValid)


   /**
* Une route pour recuperer les pvs de retour de chef plateau signe avec agent superviseur
*@method POST
* @url /scanning/retour/agent/chefPlateau/retour/pvs/supAille/pvs
*/
scanning_volumeRetour_routes.post('/agent/chefPlateau/retour/pvs/supAille/pvs', scanning_volumeRetour_controller.findGetsPvsSupAilletourNonValid)

    /**
 * Une route  recuperer  les volumes deja traitees agent superviseur aille scanning
 *@method GET
 * @url /scanning/retour/agent/volume/traitees/chefEquipe/aille
 */
 scanning_volumeRetour_routes.get('/agent/volume/traitees/chefEquipe/aille', scanning_volumeRetour_controller.findAllVolumeChefEquipeTraitesReenvoyerFolios)

   /**
 * Une route  permet  si le chef plateau est pret a signer le pv de retours un agent superviseur  
 *@method GET
 * @url /scanning/retour/agent/retour/pvs/supAilles
 */
 scanning_volumeRetour_routes.get('/agent/retour/pvs/supAilles/:ID_VOLUME', scanning_volumeRetour_controller.checkRetourSupAilleScanningTraites)

        /**
 * Une route  permet de recuperer les details de volumes chez le chef equipe
 *@method GET
 * @url /scanning/retour/agent/details/verifier/volume/dossier/valid
 */
 scanning_volumeRetour_routes.get('/agent/details/verifier/volume/dossier/valid/:ID_VOLUME', scanning_volumeRetour_controller.getVolumeDetailsVolumeTraitesValid)
 


module.exports = scanning_volumeRetour_routes