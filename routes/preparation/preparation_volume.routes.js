const express = require('express')
const preparation_volume_controller = require('../../controllers/preparation/preparation_volume_controller')
const preparation_volume_routes = express.Router()

/**
 * Une route  permet  un chef  de divisions des archives d'ajouter   les volumes 
 *@method POST
 * @url /preparation/volume
 */
 preparation_volume_routes.post('/', preparation_volume_controller.createVolume)

 /**
 * Une route  permet  un chef  de divisions des archives d'ajouter   les volumes 
 *@method POST
 * @url /preparation/volume
 */
 preparation_volume_routes.post('/', preparation_volume_controller.createVolume)


 /**
 * Une route  permet  recupere les volumes
 *@method POST
 * @url /preparation/volume
 */
 preparation_volume_routes.get('/', preparation_volume_controller.findAll)

  /**
 * Une route  permet  recupere les volumes desarchives par  un agent  desarchivages
 *@method POST
 * @url /preparation/volume/desarchives
 */
 preparation_volume_routes.get('/desarchives', preparation_volume_controller.findAllDesarchive)
 
  /**
 * Une route  permet  recupere les volumes desarchives par  un agent  desarchivages
 *@method POST
 * @url /preparation/volume/distribues
 */
 preparation_volume_routes.get('/distribues', preparation_volume_controller.findAllDistribue)


 /**
 * Une route  permet  un agent  superviseur  aile de voir  les volume prepares 
 *@method POST
 * @url /preparation/volume/volumePrepares
 */
 preparation_volume_routes.get('/volumePrepares', preparation_volume_controller.findAllVolume)

/**
 * Une route  permet  recupere les volumes et leurs details
 *@method POST
 * @url /preparation/volume
 */
 preparation_volume_routes.get('/allVolume', preparation_volume_controller.findAll)

  /**
 * Une route  permet  recupere les volumes detailler
 *@method POST
 * @url /preparation/volume/volumeDetailler
 */
 preparation_volume_routes.get('/volumeDetailler', preparation_volume_controller.findDetailler)

 
  /**
 * Une route  permet  recupere les volumes superviser par  un agnt  sup  archive
 *@method POST
 * @url /preparation/volume/volumeSuperviser
 */
 preparation_volume_routes.get('/volumeSuperviser', preparation_volume_controller.findAllVolumeSuperviser)


 /**
 * Une route  permet  recupere les volumes detailler
 *@method GET
 * @url /preparation/folio/checkAgentsup
 */
 preparation_volume_routes.get('/checkchefPlateau/:USERS_ID', preparation_volume_controller.findCheckPlateau)


 /**
 * Une route  permet  recupere les nature du folio
 *@method GET
 * @url /preparation/volume/nature
 */
 preparation_volume_routes.get('/nature', preparation_volume_controller.findNature)

 /**
 * Une route  permet  recupere les nature du folio
 *@method GET
 * @url /preparation/volume/count
 */
 preparation_volume_routes.get('/count/:ID_VOLUME', preparation_volume_controller.findCount)

 /**
 * Une route  permet  de nommer  agent superviseur  archive
 *@method PUT
 * @url /preparation/volume/modifier
 */
 preparation_volume_routes.put('/modifier/:ID_VOLUME', preparation_volume_controller.updateVolume)

 /**
 * Une route  permet  de nommer  agent distributeur
 *@method PUT
 * @url /preparation/volume/nommerDistributeur
 */
 preparation_volume_routes.put('/nommerDistributeur/:ID_VOLUME', preparation_volume_controller.nommerDistributeur)

 /**
 * Une route  permet  de nommer  agent superviseur aile
 *@method PUT
 * @url /preparation/volume/nommerSuperviseurAile
 */
 preparation_volume_routes.put('/nommerSuperviseurAile/:ID_VOLUME', preparation_volume_controller.nommerSuperviseurAile)


  /**
 * Une route  permet  de nommer  chef plateau
 *@method PUT
 * @url /preparation/volume/nommerChefPlateau
 */
 preparation_volume_routes.put('/nommerChefPlateau/:ID_VOLUME', preparation_volume_controller.nommerChefPlateau)

  /**
 * Une route  permet  de nommer  chef plateau en retour
 *@method PUT
 * @url /preparation/volume/addChefEquipe
 */
 preparation_volume_routes.put('/addChefEquipe', preparation_volume_controller.addChefPlateau)

  /**
 * Une route  permet  un agent  suoerviseur  archive 
 * de voir chef plateau  et  les volumes   
 *@method GET
 * @url /preparation/volume/chefPlateau
 */
 preparation_volume_routes.get('/chefPlateau', preparation_volume_controller.findAllChefPlateau)
   /**
 * Une route  permet  un agent  superviseur  archive 
 * de voir chef plateau  et  les volumes avec les details  
 *@method GET
 * @url /preparation/volume/detailsVolume/
 */
 preparation_volume_routes.get('/detailsVolume/:ID_VOLUME', preparation_volume_controller.getVolumeDetail)

 /**
 * Permet de recuperer un chef plateau n d'une volume  
 *@method GET
 * @url /preparation/volume/chefsPlateaux/
 */
 preparation_volume_routes.get('/chefsPlateaux/:ID_VOLUME', preparation_volume_controller.getVolumeChefPlateau)

 
 /**
 * Une route  permet  de retour  chef plateau
 *@method PUT
 * @url /preparation/volume/retourChefPlateau
 */
 preparation_volume_routes.put('/retourChefPlateau', preparation_volume_controller.retourChefPlateau)

 
  /**
 * Une route  permet  visualiser  les agent superviseur aile et les nombre de volume recu
 * de voir chef plateau  et  les volumes   
 *@method GET
 * @url /preparation/volume/agentSuperviseurAile
 */
 preparation_volume_routes.get('/agentSuperviseurAile', preparation_volume_controller.findAllAgentSupAile)

  /**
 * Une route  permet  visualiser  les agent superviseur aile et les nombre de volume recu
 * de voir chef plateau  et  les volumes   
 *@method GET
 * @url /preparation/volume/agentSupRetourPhase
 */
 preparation_volume_routes.get('/agentSupRetourPhase', preparation_volume_controller.findAllAgentSupAileRetour)
 /**
 * Une route  permet  v agent superviseur aile de voir  le volume 
 * de voir chef plateau  et  les volumes   
 *@method GET
 * @url /preparation/volume/volumeRetourPhase
 */
 preparation_volume_routes.get('/volumeRetourPhase', preparation_volume_controller.findAllVolumeRetour)
 
 /**
 * Une route  permet  de retour  agent superviseur aile
 *@method PUT
 * @url /preparation/volume/retourAgentSuperviseurAile
 */
 preparation_volume_routes.put('/retourAgentSuperviseurAile', preparation_volume_controller.retourAgentSupAile)

 /**
 * Une route  permet  de retour  agent superviseur aile vers chef equipe
 *@method PUT
 * @url /preparation/volume/retourAgentSupAile
 */
 preparation_volume_routes.put('/retourAgentSupAile', preparation_volume_controller.retourAgentSupAileRetourne)

  /**
 * Une route  permet  de retour  chef plateau  vers agent superviseur aile
 *@method PUT
 * @url /preparation/volume/retournerChefPlateau
 */
 preparation_volume_routes.put('/retournerChefPlateau', preparation_volume_controller.retourPlateauRetourne)

 /**
 * Une route  permet  de retour  chef plateau
 *@method PUT
 * @url /preparation/volume/retourChefPlateau
 */
 preparation_volume_routes.put('/retourChefPlateau', preparation_volume_controller.retourAgentSupAile)

module.exports = preparation_volume_routes
