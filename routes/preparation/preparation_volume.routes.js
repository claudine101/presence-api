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
 * Une route  permet  recupere les volumes
 *@method POST
 * @url /preparation/volume
 */
 preparation_volume_routes.get('/', preparation_volume_controller.findAll)
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
 * Une route  permet  un agent  suoerviseur  archive 
 * de voir chef plateau  et  les volumes   
 *@method GET
 * @url /preparation/volume/chefPlateau
 */
 preparation_volume_routes.get('/chefPlateau', preparation_volume_controller.findAllChefPlateau)

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
 * Une route  permet  de retour  agent superviseur aile
 *@method PUT
 * @url /preparation/volume/retourAgentSuperviseurAile
 */
 preparation_volume_routes.put('/retourAgentSuperviseurAile', preparation_volume_controller.retourAgentSupAile)

module.exports = preparation_volume_routes